import os
import sys
import time
import subprocess
from PyQt6.QtCore import QThreadPool, Qt, pyqtSlot, QTimer
from PyQt6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QHBoxLayout, QVBoxLayout,
    QGroupBox, QCheckBox, QRadioButton, QSlider, QLabel, QPushButton,
    QLineEdit, QFileDialog, QProgressBar, QMessageBox, QTableWidgetItem,
    QButtonGroup, QToolTip, QProgressDialog, QStackedWidget, QFrame
)
# pyrefly: ignore [missing-import]
from PyQt6.QtGui import QIcon, QColor, QFont, QPixmap, QPainter, QPainterPath

# Import custom application components
from ui_components import DragDropArea, ImageTableWidget, get_style_sheet
from converter_logic import scan_directory, get_image_metadata
from threading_worker import ConversionWorker, FileScannerWorker


def get_rounded_pixmap(image_path, size=36, radius=6):
    """Loads an image file, crops/scales it to a square, and clips it with rounded corners."""
    pixmap = QPixmap(image_path)
    if pixmap.isNull():
        return None
    
    # Scale to fill the target size (crop later)
    scaled = pixmap.scaled(size, size, Qt.AspectRatioMode.KeepAspectRatioByExpanding, Qt.TransformationMode.SmoothTransformation)
    
    # Target transparent canvas
    target = QPixmap(size, size)
    target.fill(Qt.GlobalColor.transparent)
    
    painter = QPainter(target)
    painter.setRenderHint(QPainter.RenderHint.Antialiasing)
    painter.setRenderHint(QPainter.RenderHint.SmoothPixmapTransform)
    
    path = QPainterPath()
    path.addRoundedRect(0, 0, size, size, radius, radius)
    painter.setClipPath(path)
    
    # Draw centered
    x = (scaled.width() - size) // 2
    y = (scaled.height() - size) // 2
    painter.drawPixmap(0, 0, scaled, x, y, size, size)
    painter.end()
    
    return target


def get_placeholder_pixmap(size=36, radius=6):
    """Creates a beautiful placeholder with a gray background and image emoji."""
    target = QPixmap(size, size)
    target.fill(Qt.GlobalColor.transparent)
    
    painter = QPainter(target)
    painter.setRenderHint(QPainter.RenderHint.Antialiasing)
    
    # Draw background card
    painter.setBrush(QColor("rgba(255, 255, 255, 0.06)"))
    painter.setPen(Qt.PenStyle.NoPen)
    painter.drawRoundedRect(0, 0, size, size, radius, radius)
    
    # Draw emoji
    painter.setPen(QColor("#64748b"))
    font = painter.font()
    font.setPointSize(14)
    painter.setFont(font)
    painter.drawText(0, 0, size, size, Qt.AlignmentFlag.AlignCenter, "🖼️")
    
    painter.end()
    return target


class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Bulk Image to WebP Converter")
        self.setMinimumSize(950, 650)
        self.resize(1100, 720)

        # Application State
        self.files_list = []  # List of dicts: {"src_path": ..., "width": ..., "height": ..., "size": ..., "status": ...}
        self.is_converting = False
        self.start_time = 0.0
        self.total_files_count = 0
        self.processed_files_count = 0
        self.success_count = 0
        self.failed_count = 0

        # Thread Pool for background execution
        self.thread_pool = QThreadPool.globalInstance()
        # Scale thread pool size to the system processor count (default 4 if cpu_count is None)
        self.thread_pool.setMaxThreadCount(os.cpu_count() or 4)

        # Set App Icon if exists
        self.set_app_icon()

        # Build UI
        self.setup_ui()

        # Apply QSS Stylesheet
        self.setStyleSheet(get_style_sheet())

        # Pulsing active dot timer
        self.pulse_timer = QTimer(self)
        self.pulse_timer.timeout.connect(self.toggle_pulse_dot)
        self.pulse_timer.start(800)
        self.pulse_state = True

        self.update_stats_display()

    def set_app_icon(self):
        """Attempts to load and set the application icon."""
        icon_path = os.path.join(os.path.dirname(__file__), "assets", "logo.ico")
        if os.path.exists(icon_path):
            self.setWindowIcon(QIcon(icon_path))
        else:
            # Fallback icon if running before assets generated
            pass

    def setup_ui(self):
        # Central widget
        central_widget = QWidget(self)
        self.setCentralWidget(central_widget)
        
        # Outer Layout: Vertical (holds navbar, columns, and footer)
        outer_layout = QVBoxLayout(central_widget)
        outer_layout.setContentsMargins(0, 0, 0, 0)
        outer_layout.setSpacing(0)

        # ==========================================
        # TOP NAVBAR HEADER (Full width)
        # ==========================================
        navbar = QFrame(self)
        navbar.setObjectName("Navbar")
        navbar_layout = QHBoxLayout(navbar)
        navbar_layout.setContentsMargins(20, 10, 20, 10)
        
        # Left side: Logo & Title
        left_nav = QWidget(self)
        left_nav_layout = QHBoxLayout(left_nav)
        left_nav_layout.setContentsMargins(0, 0, 0, 0)
        left_nav_layout.setSpacing(12)
        
        logo_label = QLabel("⚡", self)
        logo_label.setStyleSheet("font-size: 24px; color: #6366f1; font-weight: bold;")
        
        title_label = QLabel("Image to WebP", self)
        title_label.setObjectName("TitleLabel")
        title_label.setStyleSheet("font-size: 16px; font-weight: 800; color: #ffffff;")
        
        # Separator line
        sep = QLabel("|", self)
        sep.setStyleSheet("color: rgba(255, 255, 255, 0.15); font-size: 16px;")
        
        # Subtitle & Pulsing Dot
        status_container = QWidget(self)
        status_layout = QHBoxLayout(status_container)
        status_layout.setContentsMargins(0, 0, 0, 0)
        status_layout.setSpacing(6)
        
        subtitle_label = QLabel("Bulk Batch Converter", self)
        subtitle_label.setStyleSheet("color: #94a3b8; font-size: 12px; font-weight: 600;")
        
        self.pulse_dot = QLabel(self)
        self.pulse_dot.setFixedSize(8, 8)
        self.pulse_dot.setStyleSheet("background-color: #10b981; border-radius: 4px;")
        
        status_layout.addWidget(subtitle_label)
        status_layout.addWidget(self.pulse_dot)
        
        left_nav_layout.addWidget(logo_label)
        left_nav_layout.addWidget(title_label)
        left_nav_layout.addWidget(sep)
        left_nav_layout.addWidget(status_container)
        
        # Right side: Docs, Help, Theme Toggle
        right_nav = QWidget(self)
        right_nav_layout = QHBoxLayout(right_nav)
        right_nav_layout.setContentsMargins(0, 0, 0, 0)
        right_nav_layout.setSpacing(16)
        
        nav_docs = QPushButton("Docs", self)
        nav_docs.setCursor(Qt.CursorShape.PointingHandCursor)
        nav_docs.setStyleSheet("background: transparent; border: none; color: #94a3b8; font-size: 12px; font-weight: 600; padding: 4px;")
        nav_docs.setToolTip("View documentation (Mock link)")
        
        nav_help = QPushButton("Help", self)
        nav_help.setCursor(Qt.CursorShape.PointingHandCursor)
        nav_help.setStyleSheet("background: transparent; border: none; color: #94a3b8; font-size: 12px; font-weight: 600; padding: 4px;")
        nav_help.setToolTip("Get help (Mock link)")
        
        self.btn_theme_toggle = QPushButton("🌙", self)
        self.btn_theme_toggle.setFixedSize(28, 28)
        self.btn_theme_toggle.setStyleSheet("background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; font-size: 12px; padding: 0;")
        self.btn_theme_toggle.setToolTip("Toggle dark/light mode (Mock option)")
        
        right_nav_layout.addWidget(nav_docs)
        right_nav_layout.addWidget(nav_help)
        right_nav_layout.addWidget(self.btn_theme_toggle)
        
        navbar_layout.addWidget(left_nav)
        navbar_layout.addStretch()
        navbar_layout.addWidget(right_nav)
        
        outer_layout.addWidget(navbar)

        # Columns Widget (spacious margin)
        columns_widget = QWidget(self)
        columns_layout = QHBoxLayout(columns_widget)
        columns_layout.setContentsMargins(16, 16, 16, 16)
        columns_layout.setSpacing(16)

        # ==========================================
        # LEFT COLUMN: Settings & Actions Card
        # ==========================================
        left_column = QWidget(self)
        left_column.setFixedWidth(340)
        left_column_layout = QVBoxLayout(left_column)
        left_column_layout.setContentsMargins(0, 0, 0, 0)
        
        # Sleek floating glassmorphic card
        settings_card = QFrame(self)
        settings_card.setObjectName("GlassCard")
        left_layout = QVBoxLayout(settings_card)
        left_layout.setContentsMargins(16, 16, 16, 16)
        left_layout.setSpacing(18)

        # Segmented Tab 1: Output Destination
        output_sec = QWidget(self)
        output_sec_layout = QVBoxLayout(output_sec)
        output_sec_layout.setContentsMargins(0, 0, 0, 0)
        output_sec_layout.setSpacing(8)
        
        output_title = QLabel("OUTPUT DESTINATION", self)
        output_title.setStyleSheet("color: #818cf8; font-size: 11px; font-weight: 800; letter-spacing: 0.5px;")
        output_sec_layout.addWidget(output_title)
        
        self.segmented_output = QFrame(self)
        self.segmented_output.setObjectName("SegmentedControl")
        segmented_output_layout = QHBoxLayout(self.segmented_output)
        segmented_output_layout.setContentsMargins(2, 2, 2, 2)
        segmented_output_layout.setSpacing(2)
        
        self.radio_same_folder = QPushButton("Original Folder", self)
        self.radio_same_folder.setCheckable(True)
        self.radio_same_folder.setChecked(True)
        
        self.radio_custom_folder = QPushButton("Custom Folder", self)
        self.radio_custom_folder.setCheckable(True)
        
        self.output_bg = QButtonGroup(self)
        self.output_bg.addButton(self.radio_same_folder)
        self.output_bg.addButton(self.radio_custom_folder)
        
        segmented_output_layout.addWidget(self.radio_same_folder)
        segmented_output_layout.addWidget(self.radio_custom_folder)
        output_sec_layout.addWidget(self.segmented_output)

        # Custom Folder Browse Row
        folder_selection_widget = QWidget(self)
        folder_layout = QHBoxLayout(folder_selection_widget)
        folder_layout.setContentsMargins(0, 0, 0, 0)
        folder_layout.setSpacing(8)

        self.edit_output_path = QLineEdit(self)
        self.edit_output_path.setPlaceholderText("Select output folder...")
        self.edit_output_path.setEnabled(False)
        
        self.btn_browse_output = QPushButton("Browse...", self)
        self.btn_browse_output.setEnabled(False)
        self.btn_browse_output.setToolTip("Select custom destination folder for converted WebP files")

        folder_layout.addWidget(self.edit_output_path)
        folder_layout.addWidget(self.btn_browse_output)
        output_sec_layout.addWidget(folder_selection_widget)
        
        left_layout.addWidget(output_sec)

        # Segmented Tab 2: Compression Mode
        compress_sec = QWidget(self)
        compress_sec_layout = QVBoxLayout(compress_sec)
        compress_sec_layout.setContentsMargins(0, 0, 0, 0)
        compress_sec_layout.setSpacing(10)
        
        compress_title = QLabel("COMPRESSION METRIC", self)
        compress_title.setStyleSheet("color: #818cf8; font-size: 11px; font-weight: 800; letter-spacing: 0.5px;")
        compress_sec_layout.addWidget(compress_title)
        
        self.segmented_compress = QFrame(self)
        self.segmented_compress.setObjectName("SegmentedControl")
        segmented_compress_layout = QHBoxLayout(self.segmented_compress)
        segmented_compress_layout.setContentsMargins(2, 2, 2, 2)
        segmented_compress_layout.setSpacing(2)
        
        self.btn_lossy = QPushButton("Lossy (Optimized)", self)
        self.btn_lossy.setCheckable(True)
        self.btn_lossy.setChecked(True)
        
        self.chk_lossless = QPushButton("Lossless (Perfect)", self)
        self.chk_lossless.setCheckable(True)
        
        self.compress_bg = QButtonGroup(self)
        self.compress_bg.addButton(self.btn_lossy)
        self.compress_bg.addButton(self.chk_lossless)
        
        segmented_compress_layout.addWidget(self.btn_lossy)
        segmented_compress_layout.addWidget(self.chk_lossless)
        compress_sec_layout.addWidget(self.segmented_compress)

        # Quality Slider Card
        slider_widget = QWidget(self)
        slider_layout = QVBoxLayout(slider_widget)
        slider_layout.setContentsMargins(0, 0, 0, 0)
        slider_layout.setSpacing(6)

        quality_hdr = QWidget(self)
        quality_hdr_layout = QHBoxLayout(quality_hdr)
        quality_hdr_layout.setContentsMargins(0, 0, 0, 0)
        
        quality_lbl = QLabel("Quality Factor", self)
        quality_lbl.setStyleSheet("color: #cbd5e1; font-weight: 600;")
        
        self.label_quality = QLabel("85%", self)
        self.label_quality.setStyleSheet("""
            background-color: rgba(99, 102, 241, 0.15);
            color: #818cf8;
            border-radius: 4px;
            padding: 2px 8px;
            font-weight: bold;
            font-size: 11px;
        """)
        
        quality_hdr_layout.addWidget(quality_lbl)
        quality_hdr_layout.addStretch()
        quality_hdr_layout.addWidget(self.label_quality)
        
        self.slider_quality = QSlider(Qt.Orientation.Horizontal, self)
        self.slider_quality.setRange(1, 100)
        self.slider_quality.setValue(85)
        self.slider_quality.setToolTip("Set output quality (1-100). Higher quality produces larger files.")
        
        slider_layout.addWidget(quality_hdr)
        slider_layout.addWidget(self.slider_quality)
        compress_sec_layout.addWidget(slider_widget)

        # Checkboxes Settings
        checkbox_widget = QWidget(self)
        checkbox_layout = QVBoxLayout(checkbox_widget)
        checkbox_layout.setContentsMargins(0, 4, 0, 0)
        checkbox_layout.setSpacing(10)

        self.chk_transparency = QCheckBox("Preserve Transparency (Alpha)", self)
        self.chk_transparency.setChecked(True)
        self.chk_transparency.setToolTip("Keep transparency layers. If unchecked, transparent pixels convert to white background.")
        
        self.chk_overwrite = QCheckBox("Overwrite Existing WebP Files", self)
        self.chk_overwrite.setChecked(True)
        self.chk_overwrite.setToolTip("Replace matching WebP files in destination folder if they already exist")

        self.chk_keep_original = QCheckBox("Keep Original PNG Files", self)
        self.chk_keep_original.setChecked(True)
        self.chk_keep_original.setToolTip("Keep original PNG files after conversion. Unchecking this will delete the source PNG upon successful conversion.")

        checkbox_layout.addWidget(self.chk_transparency)
        checkbox_layout.addWidget(self.chk_overwrite)
        checkbox_layout.addWidget(self.chk_keep_original)
        compress_sec_layout.addWidget(checkbox_widget)
        
        left_layout.addWidget(compress_sec)

        # Action Buttons
        actions_widget = QWidget(self)
        actions_layout = QVBoxLayout(actions_widget)
        actions_layout.setContentsMargins(0, 8, 0, 0)
        actions_layout.setSpacing(8)

        self.btn_convert = QPushButton("Convert PNGs to WebP", self)
        self.btn_convert.setObjectName("ConvertButton")
        self.btn_convert.setStyleSheet("font-size: 13px; padding: 10px 16px;")
        
        self.btn_remove = QPushButton("Remove Selected Files", self)
        self.btn_clear = QPushButton("Clear File List", self)
        self.btn_open_folder = QPushButton("Open Destination Folder", self)
        self.btn_open_folder.setToolTip("Open the active destination directory in File Explorer")

        actions_layout.addWidget(self.btn_convert)
        actions_layout.addWidget(self.btn_remove)
        actions_layout.addWidget(self.btn_clear)
        actions_layout.addWidget(self.btn_open_folder)
        
        left_layout.addWidget(actions_widget)
        
        left_column_layout.addWidget(settings_card)
        columns_layout.addWidget(left_column)

        # ==========================================
        # RIGHT COLUMN: File List & Progress (Workspace Stack)
        # ==========================================
        right_column = QWidget(self)
        right_layout = QVBoxLayout(right_column)
        right_layout.setContentsMargins(0, 0, 0, 0)
        right_layout.setSpacing(12)

        # Drag and Drop Area
        self.drag_drop_area = DragDropArea(self)
        self.drag_drop_area.setFixedHeight(120)
        right_layout.addWidget(self.drag_drop_area)

        # Search Filter Row (defined as instance attribute to toggle hide/show)
        self.filter_widget = QWidget(self)
        filter_layout = QHBoxLayout(self.filter_widget)
        filter_layout.setContentsMargins(0, 4, 0, 4)
        filter_layout.setSpacing(10)
        
        self.edit_search = QLineEdit(self)
        self.edit_search.setPlaceholderText("🔍 Search/filter images by name...")
        filter_layout.addWidget(self.edit_search)
        right_layout.addWidget(self.filter_widget)

        # Stacked Widget to overlay Empty State vs Database Table
        self.workspace_stack = QStackedWidget(self)
        
        # 1. Onboarding Empty State Card
        self.empty_state_card = QFrame(self)
        self.empty_state_card.setObjectName("GlassCard")
        empty_layout = QVBoxLayout(self.empty_state_card)
        empty_layout.setAlignment(Qt.AlignmentFlag.AlignCenter)
        empty_layout.setSpacing(16)
        empty_layout.setContentsMargins(40, 40, 40, 40)
        
        empty_icon = QLabel("📥", self)
        empty_icon.setStyleSheet("font-size: 64px; color: #818cf8; margin-bottom: 8px;")
        empty_icon.setAlignment(Qt.AlignmentFlag.AlignCenter)
        
        empty_title = QLabel("No Images Imported", self)
        empty_title.setStyleSheet("font-size: 18px; font-weight: 800; color: #ffffff;")
        empty_title.setAlignment(Qt.AlignmentFlag.AlignCenter)
        
        empty_desc = QLabel("Drag and drop folders or image files (PNG, JPG, BMP, TIFF) here,\nor click the browse area to start importing files.", self)
        empty_desc.setStyleSheet("font-size: 13px; color: #64748b; line-height: 1.4;")
        empty_desc.setAlignment(Qt.AlignmentFlag.AlignCenter)
        
        btn_import = QPushButton("Import Files...", self)
        btn_import.setStyleSheet("background-color: #6366f1; color: white; border: none; font-size: 12px; font-weight: bold; border-radius: 6px; padding: 8px 16px;")
        btn_import.clicked.connect(self.on_click_browse_files)
        btn_import.setCursor(Qt.CursorShape.PointingHandCursor)
        
        empty_layout.addWidget(empty_icon)
        empty_layout.addWidget(empty_title)
        empty_layout.addWidget(empty_desc)
        empty_layout.addWidget(btn_import)
        
        # 2. Table Widget
        self.table_widget = ImageTableWidget(self)
        self.table_widget.verticalHeader().setDefaultSectionSize(48)
        
        self.workspace_stack.addWidget(self.empty_state_card)
        self.workspace_stack.addWidget(self.table_widget)
        right_layout.addWidget(self.workspace_stack)

        # Progress Section
        self.progress_bar = QProgressBar(self)
        self.progress_bar.setValue(0)
        self.progress_bar.setFixedHeight(6) # Thin linear progress line
        right_layout.addWidget(self.progress_bar)

        # Stats bar
        self.stats_widget = QWidget(self)
        stats_layout = QHBoxLayout(self.stats_widget)
        stats_layout.setContentsMargins(4, 0, 4, 0)
        
        self.label_stats = QLabel("", self)
        self.label_stats.setObjectName("StatsLabel")
        stats_layout.addWidget(self.label_stats)
        stats_layout.addStretch()
        right_layout.addWidget(self.stats_widget)

        columns_layout.addWidget(right_column)
        outer_layout.addWidget(columns_widget)

        # ==========================================
        # DEVELOPER INFO FOOTER (Full width, card grid layout)
        # ==========================================
        footer_widget = QWidget(self)
        footer_widget.setObjectName("DeveloperFooter")
        
        footer_layout = QHBoxLayout(footer_widget)
        footer_layout.setContentsMargins(20, 12, 20, 12)
        footer_layout.setSpacing(12)

        # Footer Card 1: Profile & Motto
        profile_card = QFrame(self)
        profile_card.setObjectName("FooterCard")
        profile_layout = QVBoxLayout(profile_card)
        profile_layout.setContentsMargins(12, 10, 12, 10)
        profile_layout.setSpacing(4)
        
        name_lbl = QLabel("<b>Bilal Faisal Arain</b>", self)
        name_lbl.setStyleSheet("color: #ffffff; font-size: 13px; font-weight: bold;")
        role_lbl = QLabel("Full Stack Developer & Tester", self)
        role_lbl.setStyleSheet("color: #818cf8; font-size: 11px;")
        motto_lbl = QLabel('<i>Motto: "code, test, deliver, repeat"</i>', self)
        motto_lbl.setStyleSheet("color: #a5b4fc; font-size: 10px;")
        
        profile_layout.addWidget(name_lbl)
        profile_layout.addWidget(role_lbl)
        profile_layout.addWidget(motto_lbl)

        # Footer Card 2 & 3: Experience Cards inside container
        exp_container = QWidget(self)
        exp_layout = QHBoxLayout(exp_container)
        exp_layout.setContentsMargins(0, 0, 0, 0)
        exp_layout.setSpacing(8)

        card_personal = QFrame(self)
        card_personal.setObjectName("FooterCard")
        cp_layout = QVBoxLayout(card_personal)
        cp_layout.setContentsMargins(12, 10, 12, 10)
        cp_layout.setSpacing(2)
        cp_title = QLabel("1 YEAR", self)
        cp_title.setStyleSheet("color: #10b981; font-size: 14px; font-weight: 800;")
        cp_desc = QLabel("Personal Experience\nFull Stack & QA", self)
        cp_desc.setStyleSheet("color: #cbd5e1; font-size: 10px;")
        cp_layout.addWidget(cp_title)
        cp_layout.addWidget(cp_desc)

        card_professional = QFrame(self)
        card_professional.setObjectName("FooterCard")
        cpro_layout = QVBoxLayout(card_professional)
        cpro_layout.setContentsMargins(12, 10, 12, 10)
        cpro_layout.setSpacing(2)
        cpro_title = QLabel("5 MONTHS", self)
        cpro_title.setStyleSheet("color: #a855f7; font-size: 14px; font-weight: 800;")
        cpro_desc = QLabel("Professional Experience\nat CodeCreatives", self)
        cpro_desc.setStyleSheet("color: #cbd5e1; font-size: 10px;")
        cpro_layout.addWidget(cpro_title)
        cpro_layout.addWidget(cpro_desc)

        exp_layout.addWidget(card_personal)
        exp_layout.addWidget(card_professional)

        # Footer Card 4: Contact Handles & Socials
        contact_card = QFrame(self)
        contact_card.setObjectName("FooterCard")
        contact_layout = QVBoxLayout(contact_card)
        contact_layout.setContentsMargins(12, 10, 12, 10)
        contact_layout.setSpacing(4)
        
        contact_title = QLabel("CONNECT & CONTACT", self)
        contact_title.setStyleSheet("color: #64748b; font-size: 9px; font-weight: bold; letter-spacing: 0.5px;")
        
        row1 = QLabel("📞 Phone: 0327-2190535  |  ✉️ Email: bilalfaisalarain@gmail.com", self)
        row1.setStyleSheet("color: #cbd5e1; font-size: 11px;")
        row2 = QLabel("📸 Instagram: @bilal.faisalarain  |  💻 GitHub: github.com/BilalFaisaldev", self)
        row2.setStyleSheet("color: #cbd5e1; font-size: 11px;")
        
        contact_layout.addWidget(contact_title)
        contact_layout.addWidget(row1)
        contact_layout.addWidget(row2)

        footer_layout.addWidget(profile_card, 3)
        footer_layout.addWidget(exp_container, 4)
        footer_layout.addWidget(contact_card, 5)
        
        outer_layout.addWidget(footer_widget)

        # Bind UI Signals
        self.bind_signals()

    def bind_signals(self):
        """Connect UI components to their action handlers."""
        # Output folder options
        self.radio_custom_folder.toggled.connect(self.on_output_type_changed)
        self.btn_browse_output.clicked.connect(self.on_browse_output_clicked)

        # Lossless toggle (disables quality slider since lossless doesn't use lossy quality factor)
        self.chk_lossless.toggled.connect(self.on_lossless_toggled)
        self.slider_quality.valueChanged.connect(self.on_quality_slider_changed)

        # Drag and Drop
        self.drag_drop_area.files_dropped.connect(self.on_files_dropped)
        self.drag_drop_area.clicked.connect(self.on_click_browse_files)

        # Action Buttons
        self.btn_convert.clicked.connect(self.on_convert_clicked)
        self.btn_clear.clicked.connect(self.on_clear_clicked)
        self.btn_remove.clicked.connect(self.on_remove_selected_clicked)
        self.btn_open_folder.clicked.connect(self.on_open_folder_clicked)

        # Search Signal
        self.edit_search.textChanged.connect(self.on_search_changed)

        # Table Signals
        self.table_widget.remove_requested.connect(self.remove_rows)
        self.table_widget.clear_all_requested.connect(self.on_clear_clicked)
        self.table_widget.open_folder_requested.connect(self.open_file_folder)
        self.table_widget.cellDoubleClicked.connect(self.on_table_cell_double_clicked)

    # ==========================================
    # EVENT HANDLERS
    # ==========================================

    @pyqtSlot(bool)
    def on_output_type_changed(self, custom_selected):
        """Enables/disables the output folder selector text and button."""
        self.edit_output_path.setEnabled(custom_selected)
        self.btn_browse_output.setEnabled(custom_selected)

    @pyqtSlot()
    def on_browse_output_clicked(self):
        """Opens folder picker to select custom destination folder."""
        folder = QFileDialog.getExistingDirectory(self, "Select Destination Folder", self.edit_output_path.text())
        if folder:
            self.edit_output_path.setText(os.path.normpath(folder))

    @pyqtSlot(bool)
    def on_lossless_toggled(self, checked):
        """Greys out quality slider if lossless mode is enabled."""
        self.slider_quality.setEnabled(not checked)
        if checked:
            self.label_quality.setText("Quality: N/A (Lossless)")
        else:
            self.label_quality.setText(f"Quality: {self.slider_quality.value()}%")

    @pyqtSlot(int)
    def on_quality_slider_changed(self, value):
        """Updates text reflecting quality percentage slider value."""
        self.label_quality.setText(f"Quality: {value}%")

    @pyqtSlot()
    def on_click_browse_files(self):
        """Triggers file picker when clicking the Drag & Drop area."""
        if self.is_converting:
            return

        files, _ = QFileDialog.getOpenFileNames(
            self, "Select Images to Convert", "", "Image Files (*.png *.jpg *.jpeg *.bmp *.tiff)"
        )
        if files:
            self.process_incoming_paths(files)

    @pyqtSlot(list)
    def on_files_dropped(self, paths):
        """Processes files and folders dropped into the Drag & Drop frame."""
        if self.is_converting:
            return
        self.process_incoming_paths(paths)

    def process_incoming_paths(self, paths):
        """Launches a background thread to scan paths and load metadata asynchronously."""
        if self.is_converting:
            return

        self.progress_dialog = QProgressDialog("Scanning and loading images...", "Cancel", 0, 100, self)
        self.progress_dialog.setWindowModality(Qt.WindowModality.WindowModal)
        self.progress_dialog.setAutoClose(True)
        self.progress_dialog.setMinimumDuration(500) # Only show if loading takes >500ms
        self.progress_dialog.canceled.connect(self.on_scan_canceled)

        self.scanner_worker = FileScannerWorker(paths)
        self.scanner_worker.signals.progress.connect(self.on_scan_progress)
        self.scanner_worker.signals.finished.connect(self.on_scan_finished)
        self.scanner_worker.start()

    def on_scan_progress(self, current, total):
        self.progress_dialog.setMaximum(total)
        self.progress_dialog.setValue(current)
        self.progress_dialog.setLabelText(f"Scanning and loading images... {current} / {total}")

    def on_scan_canceled(self):
        if hasattr(self, "scanner_worker") and self.scanner_worker.isRunning():
            self.scanner_worker.is_cancelled = True
            self.scanner_worker.wait()

    def on_scan_finished(self, results):
        if not results:
            return

        self.table_widget.setUpdatesEnabled(False)
        # Filter duplicates already in our files_list
        existing_paths = {item["src_path"] for item in self.files_list}
        added_count = 0

        for file_entry in results:
            if file_entry["src_path"] not in existing_paths:
                self.files_list.append(file_entry)
                self.add_table_row(file_entry)
                added_count += 1

        self.table_widget.setUpdatesEnabled(True)
        self.update_stats_display()
        if added_count > 0:
            self.progress_bar.setValue(0)

    def add_table_row(self, file_entry):
        """Appends a row to the TableWidget for the new file entry."""
        row = self.table_widget.rowCount()
        self.table_widget.insertRow(row)

        basename = os.path.basename(file_entry["src_path"])
        
        # Column 0: Container Widget with rounded thumbnail placeholder & name
        cell_widget = QWidget()
        cell_layout = QHBoxLayout(cell_widget)
        cell_layout.setContentsMargins(8, 4, 8, 4)
        cell_layout.setSpacing(10)
        
        thumb_label = QLabel()
        thumb_label.setFixedSize(36, 36)
        thumb_label.setPixmap(get_placeholder_pixmap())
        
        name_label = QLabel(basename)
        name_label.setStyleSheet("color: #f8fafc; font-weight: 500;")
        
        cell_layout.addWidget(thumb_label)
        cell_layout.addWidget(name_label)
        cell_layout.addStretch()
        
        cell_widget.thumb_label = thumb_label
        
        # Store full path inside tool tip for clarity on the item
        name_item = QTableWidgetItem(basename)
        name_item.setToolTip(file_entry["src_path"])
        
        # Add item & widget to Column 0
        self.table_widget.setItem(row, 0, name_item)
        self.table_widget.setCellWidget(row, 0, cell_widget)

        # Column 1: Path (Hidden column used for referencing)
        path_item = QTableWidgetItem(file_entry["src_path"])
        self.table_widget.setItem(row, 1, path_item)

        # Column 2: Resolution
        res_str = "Pending"
        res_item = QTableWidgetItem(res_str)
        res_item.setTextAlignment(Qt.AlignmentFlag.AlignCenter)
        res_item.setForeground(QColor("#64748b")) # Dim gray
        self.table_widget.setItem(row, 2, res_item)

        # Column 3: Original Size
        size_str = self.format_size(file_entry["size"])
        size_item = QTableWidgetItem(size_str)
        size_item.setTextAlignment(Qt.AlignmentFlag.AlignRight | Qt.AlignmentFlag.AlignVCenter)
        self.table_widget.setItem(row, 3, size_item)

        # Column 4: Status
        status_item = QTableWidgetItem("Pending")
        status_item.setTextAlignment(Qt.AlignmentFlag.AlignCenter)
        status_item.setForeground(QColor("#cbd5e1")) # grey color
        self.table_widget.setItem(row, 4, status_item)

    def format_size(self, size_bytes):
        """Converts bytes to readable human size."""
        if not size_bytes or size_bytes <= 0:
            return "0 B"
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size_bytes < 1024.0:
                return f"{size_bytes:.1f} {unit}"
            size_bytes /= 1024.0
        return f"{size_bytes:.1f} TB"

    def update_stats_display(self):
        """Updates the statistics label at the bottom of the table."""
        total = len(self.files_list)
        total_size = sum(item["size"] for item in self.files_list)
        formatted_size = self.format_size(total_size)
        
        if total == 0:
            self.label_stats.setText("No images selected.")
            self.workspace_stack.setCurrentIndex(0)
            self.filter_widget.hide()
            self.progress_bar.hide()
            self.stats_widget.hide()
        else:
            self.label_stats.setText(f"Total Selected: {total} image(s) | Total File Size: {formatted_size}")
            self.workspace_stack.setCurrentIndex(1)
            self.filter_widget.show()
            self.progress_bar.show()
            self.stats_widget.show()

        # Enable/disable main actions based on count
        self.btn_convert.setEnabled(total > 0 and not self.is_converting)
        self.btn_clear.setEnabled(total > 0 and not self.is_converting)
        self.btn_remove.setEnabled(total > 0 and not self.is_converting)

    @pyqtSlot()
    def on_remove_selected_clicked(self):
        """Removes the items currently highlighted/selected in the table."""
        if self.is_converting:
            return
        selected_rows = self.table_widget.get_selected_rows()
        if not selected_rows:
            QMessageBox.information(self, "No Selection", "Please select one or more files in the list to remove.")
            return
        self.remove_rows(selected_rows)

    def remove_rows(self, rows):
        """Deletes rows in descending order to avoid shift indexing errors."""
        for row in reversed(rows):
            # Remove from backend files list
            path_in_row = self.table_widget.item(row, 1).text()
            self.files_list = [item for item in self.files_list if item["src_path"] != path_in_row]
            self.table_widget.removeRow(row)
        self.update_stats_display()

    @pyqtSlot()
    def on_clear_clicked(self):
        """Clears the table and files list completely."""
        if self.is_converting:
            return
        self.files_list.clear()
        self.table_widget.setRowCount(0)
        self.progress_bar.setValue(0)
        self.update_stats_display()

    @pyqtSlot()
    def on_open_folder_clicked(self):
        """Opens either the custom destination folder or the original path of the first file in explorer."""
        dest_dir = self.get_destination_directory()
        if dest_dir and os.path.exists(dest_dir):
            self.open_system_folder(dest_dir)
        else:
            QMessageBox.warning(self, "Path Not Found", "The destination path does not exist yet. It will be created when conversion runs.")

    def get_destination_directory(self):
        """Determines destination directory depending on save settings."""
        if self.radio_custom_folder.isChecked():
            path = self.edit_output_path.text().strip()
            return os.path.normpath(path) if path else None
        else:
            # Same folder: if we have files, return directory of the first file
            if self.files_list:
                return os.path.dirname(self.files_list[0]["src_path"])
            return None

    def open_system_folder(self, folder_path):
        """Platform-safe open folder in system file explorer."""
        if sys.platform == 'win32':
            os.startfile(folder_path)
        elif sys.platform == 'darwin':
            subprocess.Popen(['open', folder_path])
        else:
            subprocess.Popen(['xdg-open', folder_path])

    def open_file_folder(self, file_path):
        """Opens file explorer and highlights the specified file (Windows only fallback)."""
        parent_dir = os.path.dirname(file_path)
        if os.path.exists(parent_dir):
            if sys.platform == 'win32':
                # Open folder and select file
                subprocess.run(['explorer', '/select,', os.path.normpath(file_path)])
            else:
                self.open_system_folder(parent_dir)

    # ==========================================
    # CONVERSION ORCHESTRATION
    # ==========================================

    @pyqtSlot()
    def on_convert_clicked(self):
        if self.is_converting:
            self.cancel_conversion()
            return

        if not self.files_list:
            return

        # If custom folder option selected, make sure path is set
        if self.radio_custom_folder.isChecked():
            dest_dir = self.edit_output_path.text().strip()
            if not dest_dir:
                QMessageBox.warning(self, "No Output Folder", "Please specify a custom output folder path.")
                return

        # Toggle UI controls to block interaction
        self.toggle_controls(False)
        self.is_converting = True
        self.is_cancelled = False

        # Initialize progress tracking
        self.total_files_count = len(self.files_list)
        self.processed_files_count = 0
        self.success_count = 0
        self.failed_count = 0
        self.progress_bar.setValue(0)
        self.progress_bar.setMaximum(self.total_files_count)
        self.start_time = time.perf_counter()

        # Reset statuses of files in table
        for row in range(self.table_widget.rowCount()):
            path = self.table_widget.item(row, 1).text()
            # Find in list
            for entry in self.files_list:
                if entry["src_path"] == path:
                    entry["status"] = "Pending"
                    entry["webp_size"] = 0
                    entry["error_msg"] = ""
            
            # Reset table status cell
            status_item = self.table_widget.item(row, 4)
            status_item.setText("Pending")
            status_item.setForeground(QColor("#cbd5e1")) # grey

            # Reset Size column back to original
            for entry in self.files_list:
                if entry["src_path"] == path:
                    orig_size_str = self.format_size(entry["size"])
                    self.table_widget.item(row, 3).setText(orig_size_str)

        # Initialize pending files queue
        self.pending_files = []
        for row in range(self.table_widget.rowCount()):
            src_path = self.table_widget.item(row, 1).text()
            
            # Determine destination path
            basename = os.path.basename(src_path)
            name_without_ext, _ = os.path.splitext(basename)
            webp_name = f"{name_without_ext}.webp"

            if self.radio_custom_folder.isChecked():
                dest_folder = self.edit_output_path.text().strip()
                dest_path = os.path.join(dest_folder, webp_name)
            else:
                dest_folder = os.path.dirname(src_path)
                dest_path = os.path.join(dest_folder, webp_name)

            self.pending_files.append((src_path, dest_path))

        self.active_workers_count = 0
        
        # Start initial batch up to max threads
        max_threads = os.cpu_count() or 4
        for _ in range(min(max_threads, len(self.pending_files))):
            self.start_next_worker()

    def start_next_worker(self):
        """Pulls the next file from the pending list and schedules a conversion worker."""
        if not self.pending_files or self.is_cancelled:
            return

        src_path, dest_path = self.pending_files.pop(0)
        
        quality = self.slider_quality.value()
        lossless = self.chk_lossless.isChecked()
        preserve_transparency = self.chk_transparency.isChecked()
        overwrite = self.chk_overwrite.isChecked()

        worker = ConversionWorker(
            src_path=src_path,
            dest_path=dest_path,
            quality=quality,
            lossless=lossless,
            preserve_transparency=preserve_transparency,
            overwrite=overwrite
        )

        worker.signals.started.connect(self.on_worker_started)
        worker.signals.finished.connect(self.on_worker_finished)

        self.active_workers_count += 1
        self.thread_pool.start(worker)

    def cancel_conversion(self):
        """Cancels conversion by clearing pending queue and updating UI state."""
        self.is_cancelled = True
        self.pending_files.clear()
        self.btn_convert.setText("Cancelling...")
        self.btn_convert.setEnabled(False)
        self.progress_bar.setFormat("Cancelling... %p%")

    def toggle_controls(self, enabled):
        """Enables or disables settings and controls during active conversion."""
        self.radio_same_folder.setEnabled(enabled)
        self.radio_custom_folder.setEnabled(enabled)
        if self.radio_custom_folder.isChecked():
            self.edit_output_path.setEnabled(enabled)
            self.btn_browse_output.setEnabled(enabled)
        
        self.btn_lossy.setEnabled(enabled)
        self.chk_lossless.setEnabled(enabled)
        if not self.chk_lossless.isChecked():
            self.slider_quality.setEnabled(enabled)
            
        self.chk_transparency.setEnabled(enabled)
        self.chk_overwrite.setEnabled(enabled)
        self.chk_keep_original.setEnabled(enabled)

        self.btn_clear.setEnabled(enabled)
        self.btn_remove.setEnabled(enabled)
        self.drag_drop_area.setEnabled(enabled)

        if not enabled:
            # Change to Cancel button
            self.btn_convert.setText("Cancel Conversion")
            self.btn_convert.setObjectName("CancelButton")
            self.btn_convert.setEnabled(True)
        else:
            # Change back to Convert button
            self.btn_convert.setText("Convert PNGs to WebP")
            self.btn_convert.setObjectName("ConvertButton")
            self.btn_convert.setEnabled(True)

        # Force stylesheet update
        self.btn_convert.style().unpolish(self.btn_convert)
        self.btn_convert.style().polish(self.btn_convert)

    def find_row_by_path(self, path):
        """Finds row index in TableWidget corresponding to the given file path."""
        for row in range(self.table_widget.rowCount()):
            if self.table_widget.item(row, 1).text() == path:
                return row
        return -1

    @pyqtSlot(str)
    def on_worker_started(self, src_path):
        """Handles worker started signal, changing file status to Converting."""
        row = self.find_row_by_path(src_path)
        if row != -1:
            status_item = self.table_widget.item(row, 4)
            status_item.setText("Converting...")
            status_item.setForeground(QColor("#6366f1")) # Indigo

    @pyqtSlot(str, bool, str, int, float, int, int)
    def on_worker_finished(self, src_path, success, message, output_size, duration, width, height):
        """Handles worker finished signal, updating status, size and processing metrics."""
        self.processed_files_count += 1
        self.active_workers_count -= 1
        row = self.find_row_by_path(src_path)

        # Update stats
        if success:
            self.success_count += 1
            status_str = "Success"
            status_color = QColor("#34d399") # Emerald Green
            
            # Handle Delete Original setting
            if not self.chk_keep_original.isChecked():
                try:
                    os.remove(src_path)
                except Exception as e:
                    # Log delete error but do not break conversion success
                    message = f"Success, but failed to delete original: {str(e)}"
        else:
            self.failed_count += 1
            status_str = "Error"
            status_color = QColor("#f87171") # Red

        # Update UI Table Row
        if row != -1:
            # If successful, load converted image thumbnail
            if success:
                basename = os.path.basename(src_path)
                name_without_ext, _ = os.path.splitext(basename)
                webp_name = f"{name_without_ext}.webp"
                if self.radio_custom_folder.isChecked():
                    dest_folder = self.edit_output_path.text().strip()
                    dest_path = os.path.join(dest_folder, webp_name)
                else:
                    dest_folder = os.path.dirname(src_path)
                    dest_path = os.path.join(dest_folder, webp_name)
                
                try:
                    pix = get_rounded_pixmap(dest_path)
                    if pix:
                        cell_w = self.table_widget.cellWidget(row, 0)
                        if cell_w and hasattr(cell_w, "thumb_label"):
                            cell_w.thumb_label.setPixmap(pix)
                except Exception as e:
                    pass

            # Status Cell
            status_item = self.table_widget.item(row, 4)
            status_item.setText(status_str)
            status_item.setForeground(status_color)
            status_item.setToolTip(message if not success else f"Converted in {duration:.2f}s")

            # Update Resolution Cell
            if success and width and height:
                res_item = self.table_widget.item(row, 2)
                res_item.setText(f"{width} × {height}")
                res_item.setForeground(QColor("#f8fafc")) # Normal light color
            elif not success:
                res_item = self.table_widget.item(row, 2)
                res_item.setText("Fail")
                res_item.setForeground(QColor("#f87171"))

            # Update size cell: "Orig -> WebP"
            for entry in self.files_list:
                if entry["src_path"] == src_path:
                    entry["status"] = status_str
                    entry["webp_size"] = output_size
                    entry["error_msg"] = message
                    
                    orig_sz = self.format_size(entry["size"])
                    if success:
                        webp_sz = self.format_size(output_size)
                        # Compute compression ratio
                        ratio = ((entry["size"] - output_size) / entry["size"]) * 100 if entry["size"] > 0 else 0
                        size_text = f"{orig_sz} → {webp_sz} (-{ratio:.0f}%)"
                        # Set tooltip
                        self.table_widget.item(row, 3).setToolTip(f"Original: {orig_sz}\nWebP: {webp_sz}\nRatio: -{ratio:.1f}%")
                    else:
                        size_text = orig_sz
                        self.table_widget.item(row, 3).setToolTip("Conversion failed")
                        
                    self.table_widget.item(row, 3).setText(size_text)

        # Update overall progress bar
        self.progress_bar.setValue(self.processed_files_count)

        # Start next worker if queue not empty
        if not self.is_cancelled and self.pending_files:
            self.start_next_worker()

        # Check if all active workers completed
        if self.active_workers_count <= 0:
            self.on_all_conversions_completed()

    def on_all_conversions_completed(self):
        """Concludes the conversion run, displays results popup and unlocks the UI."""
        self.is_converting = False
        self.toggle_controls(True)
        self.update_stats_display()
        self.progress_bar.setFormat("%p%")

        total_time = time.perf_counter() - self.start_time

        # Calculate space savings
        total_orig_size = sum(item["size"] for item in self.files_list if item["status"] == "Success")
        total_webp_size = sum(item["webp_size"] for item in self.files_list if item["status"] == "Success")
        savings = total_orig_size - total_webp_size
        savings_pct = (savings / total_orig_size) * 100 if total_orig_size > 0 else 0

        if self.is_cancelled:
            summary_msg = (
                f"Conversion process was cancelled by user.\n\n"
                f"● Total Processed: {self.processed_files_count}\n"
                f"● Successful: {self.success_count}\n"
                f"● Failed: {self.failed_count}\n"
            )
        else:
            summary_msg = (
                f"Batch processing completed in {total_time:.2f} seconds.\n\n"
                f"● Total Files: {self.total_files_count}\n"
                f"● Successful: {self.success_count}\n"
                f"● Failed: {self.failed_count}\n"
            )
            
        if self.success_count > 0:
            summary_msg += (
                f"\nStorage savings: {self.format_size(savings)} (-{savings_pct:.1f}%)\n"
            )

        QMessageBox.information(
            self,
            "Conversion Complete" if not self.is_cancelled else "Conversion Cancelled",
            summary_msg
        )

    @pyqtSlot(str)
    def on_search_changed(self, text):
        """Filters rows in the TableWidget based on the search query."""
        search_query = text.strip().lower()
        self.table_widget.setUpdatesEnabled(False)
        for row in range(self.table_widget.rowCount()):
            filename = self.table_widget.item(row, 0).text().lower()
            if search_query in filename:
                self.table_widget.setRowHidden(row, False)
            else:
                self.table_widget.setRowHidden(row, True)
        self.table_widget.setUpdatesEnabled(True)

    @pyqtSlot(int, int)
    def on_table_cell_double_clicked(self, row, column):
        """Shows full error details if the clicked file failed conversion."""
        status_item = self.table_widget.item(row, 4)
        if status_item and status_item.text() == "Error":
            src_path = self.table_widget.item(row, 1).text()
            for entry in self.files_list:
                if entry["src_path"] == src_path:
                    error_msg = entry["error_msg"]
                    QMessageBox.critical(
                        self,
                        "Conversion Error Detail",
                        f"File: {os.path.basename(src_path)}\n\nError Message:\n{error_msg}"
                    )
                    break

    @pyqtSlot()
    def toggle_pulse_dot(self):
        """Toggles the opacity of the active dot to animate it pulsing."""
        self.pulse_state = not self.pulse_state
        if self.pulse_state:
            self.pulse_dot.setStyleSheet("background-color: #10b981; border-radius: 4px;")
        else:
            self.pulse_dot.setStyleSheet("background-color: rgba(16, 185, 129, 0.25); border-radius: 4px;")


def main():
    app = QApplication(sys.argv)
    
    window = MainWindow()
    window.show()
    sys.exit(app.exec())


if __name__ == "__main__":
    main()
