import os
from PyQt6.QtCore import Qt, pyqtSignal, QMimeData
from PyQt6.QtWidgets import (
    QFrame, QVBoxLayout, QLabel, QTableWidget, QTableWidgetItem,
    QHeaderView, QAbstractItemView, QMenu
)
from PyQt6.QtGui import QDragEnterEvent, QDragLeaveEvent, QDropEvent, QColor

def get_style_sheet():
    """
    Returns the modern dark-themed QSS stylesheet.
    """
    return """
    /* Main Window */
    QMainWindow {
        background: qlineargradient(x1:0, y1:0, x2:0, y2:1, stop:0 #090d16, stop:1 #020408);
    }

    QWidget {
        color: #f8fafc;
        font-family: 'Inter', 'Plus Jakarta Sans', 'Segoe UI', -apple-system, sans-serif;
        font-size: 13px;
    }

    /* Glassmorphism Panels */
    QGroupBox {
        background-color: rgba(30, 41, 59, 0.25); /* Semi-transparent slate */
        border: 1px solid rgba(255, 255, 255, 0.06); /* Thin glowing border */
        border-radius: 12px;
        margin-top: 12px;
        padding-top: 16px;
        font-weight: bold;
        color: #e2e8f0;
    }
    QGroupBox::title {
        subcontrol-origin: margin;
        subcontrol-position: top left;
        left: 12px;
        padding: 0 6px;
        color: #818cf8; /* Indigo 400 */
    }

    /* Floating card for left column */
    QFrame#GlassCard {
        background-color: rgba(15, 23, 42, 0.45); /* Semi-transparent deep dark slate */
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 16px;
    }

    /* Segmented Controls Pill Container */
    QFrame#SegmentedControl {
        background-color: #040810; /* Ultra deep dark */
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 8px;
        padding: 2px;
    }
    QFrame#SegmentedControl QPushButton {
        background-color: transparent;
        border: none;
        border-radius: 6px;
        color: #64748b; /* Slate 400 */
        padding: 6px 12px;
        font-weight: bold;
        font-size: 11px;
    }
    QFrame#SegmentedControl QPushButton:hover {
        color: #ffffff;
        background-color: rgba(255, 255, 255, 0.04);
    }
    QFrame#SegmentedControl QPushButton:checked {
        background-color: #6366f1; /* Indigo 500 */
        color: #ffffff;
    }

    /* Labels */
    QLabel {
        color: #cbd5e1; /* Slate 300 */
    }
    
    QLabel#TitleLabel {
        font-size: 18px;
        font-weight: 800;
        color: #ffffff;
        letter-spacing: -0.5px;
    }

    QLabel#StatsLabel {
        font-family: 'Inter', sans-serif;
        font-size: 12px;
        color: #818cf8; /* Indigo 400 */
        font-weight: 500;
    }

    /* Buttons */
    QPushButton {
        background-color: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 8px;
        color: #e2e8f0;
        padding: 8px 16px;
        font-weight: 600;
        min-height: 20px;
    }
    QPushButton:hover {
        background-color: rgba(255, 255, 255, 0.08);
        border-color: rgba(255, 255, 255, 0.2);
    }
    QPushButton:pressed {
        background-color: rgba(255, 255, 255, 0.01);
    }
    QPushButton:disabled {
        background-color: rgba(255, 255, 255, 0.01);
        color: #475569;
        border-color: rgba(255, 255, 255, 0.02);
    }

    /* Massive Gradient Primary Action CTA Button */
    QPushButton#ConvertButton {
        background: qlineargradient(x1:0, y1:0, x2:1, y2:0, stop:0 #6366f1, stop:1 #a855f7); /* Indigo to Violet */
        border: none;
        color: #ffffff;
        font-size: 13px;
        font-weight: 800;
        border-radius: 8px;
        padding: 10px 18px;
    }
    QPushButton#ConvertButton:hover {
        background: qlineargradient(x1:0, y1:0, x2:1, y2:0, stop:0 #4f46e5, stop:1 #9333ea);
    }
    QPushButton#ConvertButton:pressed {
        background: qlineargradient(x1:0, y1:0, x2:1, y2:0, stop:0 #3730a3, stop:1 #701a75);
    }
    QPushButton#ConvertButton:disabled {
        background: rgba(99, 102, 241, 0.15);
        color: rgba(255, 255, 255, 0.3);
        border: none;
    }

    /* Red/Warning Cancel Button */
    QPushButton#CancelButton {
        background: qlineargradient(x1:0, y1:0, x2:1, y2:0, stop:0 #dc2626, stop:1 #ef4444);
        border: none;
        color: #ffffff;
        font-size: 13px;
        font-weight: 800;
        border-radius: 8px;
        padding: 10px 18px;
    }
    QPushButton#CancelButton:hover {
        background: qlineargradient(x1:0, y1:0, x2:1, y2:0, stop:0 #b91c1c, stop:1 #dc2626);
    }
    QPushButton#CancelButton:disabled {
        background: rgba(220, 38, 38, 0.15);
        color: rgba(255, 255, 255, 0.3);
    }

    /* Text Inputs / Path Editor & Search Bar */
    QLineEdit {
        background-color: #040810;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 8px;
        padding: 8px 14px;
        color: #ffffff;
    }
    QLineEdit:focus {
        border: 1px solid #6366f1; /* Indigo focus glow */
    }
    QLineEdit:disabled {
        background-color: rgba(15, 23, 42, 0.2);
        color: #475569;
    }

    /* Slider Customization */
    QSlider::groove:horizontal {
        height: 6px;
        background: rgba(255, 255, 255, 0.08);
        border-radius: 3px;
    }
    QSlider::sub-page:horizontal {
        background: qlineargradient(x1:0, y1:0, x2:1, y2:0, stop:0 #6366f1, stop:1 #818cf8);
        border-radius: 3px;
    }
    QSlider::handle:horizontal {
        background: #ffffff;
        border: 2px solid #6366f1;
        width: 14px;
        height: 14px;
        margin-top: -4px;
        border-radius: 7px;
    }
    QSlider::handle:horizontal:hover {
        background: #e0e7ff;
        border-color: #4f46e5;
    }

    /* Checkbox Customization */
    QCheckBox {
        color: #cbd5e1;
        spacing: 8px;
    }
    QCheckBox::indicator {
        width: 18px;
        height: 18px;
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 4px;
        background-color: #040810;
    }
    QCheckBox::indicator:hover {
        border-color: #6366f1;
    }
    QCheckBox::indicator:checked {
        border-color: #6366f1;
        background-color: #6366f1;
        image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'><path d='M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z'/></svg>");
    }

    /* Progress Bar styled as a modern accent line */
    QProgressBar {
        border: none;
        background-color: rgba(255, 255, 255, 0.03);
        border-radius: 3px;
        text-align: right;
        color: #cbd5e1;
        font-weight: bold;
        font-size: 10px;
    }
    QProgressBar::chunk {
        background: qlineargradient(x1:0, y1:0, x2:1, y2:0, stop:0 #6366f1, stop:1 #a855f7);
        border-radius: 3px;
    }

    /* Table Styling */
    QTableWidget {
        background-color: rgba(15, 23, 42, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 12px;
        gridline-color: rgba(255, 255, 255, 0.03);
        selection-background-color: rgba(99, 102, 241, 0.15);
        selection-color: #ffffff;
        outline: none;
    }
    QTableWidget::item {
        padding: 8px 12px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    }
    QTableWidget::item:selected {
        background-color: rgba(99, 102, 241, 0.15);
    }
    QHeaderView::section {
        background-color: #050912;
        color: #94a3b8;
        padding: 10px;
        border: none;
        border-bottom: 2px solid rgba(255, 255, 255, 0.08);
        font-weight: bold;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    /* Scrollbars */
    QScrollBar:vertical {
        border: none;
        background: transparent;
        width: 8px;
    }
    QScrollBar::handle:vertical {
        background: rgba(255, 255, 255, 0.1);
        min-height: 20px;
        border-radius: 4px;
    }
    QScrollBar::handle:vertical:hover {
        background: rgba(99, 102, 241, 0.6);
    }
    QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical {
        height: 0px;
    }

    /* Header / Navbar Style */
    QFrame#Navbar {
        background-color: rgba(10, 15, 30, 0.7);
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }

    /* Developer Footer Container */
    QWidget#DeveloperFooter {
        background-color: rgba(6, 10, 18, 0.85);
        border-top: 1px solid rgba(255, 255, 255, 0.06);
    }

    /* Footer Card Style */
    QFrame#FooterCard {
        background-color: rgba(30, 41, 59, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 8px;
    }
    QFrame#FooterCard:hover {
        border-color: rgba(99, 102, 241, 0.25);
        background-color: rgba(99, 102, 241, 0.03);
    }
    """

class DragDropArea(QFrame):
    """
    A custom frame that accepts drag-and-drop files/folders
    and reacts visually by changing style sheets.
    Also accepts mouse clicks to act as a file selector.
    """
    files_dropped = pyqtSignal(list)
    clicked = pyqtSignal()

    def __init__(self, parent=None):
        super().__init__(parent)
        self.setAcceptDrops(True)
        self.setObjectName("DragDropArea")
        self.setup_ui()
        self.set_normal_style()

    def setup_ui(self):
        layout = QVBoxLayout(self)
        layout.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.setSpacing(6)

        # Large modern cloud icon
        self.icon_label = QLabel("☁️", self)
        self.icon_label.setStyleSheet("font-size: 44px; color: #818cf8; margin-bottom: 4px;")
        self.icon_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.addWidget(self.icon_label)

        # Primary label
        self.primary_label = QLabel("Drag & Drop Images (PNG, JPG, BMP, TIFF) or Folders here", self)
        self.primary_label.setStyleSheet("font-size: 14px; font-weight: 700; color: #ffffff;")
        self.primary_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.addWidget(self.primary_label)

        # Secondary label
        self.secondary_label = QLabel("or click to browse from device", self)
        self.secondary_label.setStyleSheet("font-size: 12px; color: #64748b;")
        self.secondary_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.addWidget(self.secondary_label)

    def set_normal_style(self):
        self.setStyleSheet("""
            QFrame#DragDropArea {
                border: 2px dashed rgba(255, 255, 255, 0.15);
                border-radius: 12px;
                background-color: rgba(255, 255, 255, 0.02);
            }
            QFrame#DragDropArea:hover {
                border-color: #6366f1; /* Indigo 500 */
                background-color: rgba(99, 102, 241, 0.05);
            }
        """)

    def set_highlight_style(self):
        self.setStyleSheet("""
            QFrame#DragDropArea {
                border: 2px dashed #10b981; /* Emerald Green */
                border-radius: 12px;
                background-color: rgba(16, 185, 129, 0.08);
            }
        """)

    # Drag events
    def dragEnterEvent(self, event: QDragEnterEvent):
        if event.mimeData().hasUrls():
            event.acceptProposedAction()
            self.set_highlight_style()
        else:
            event.ignore()

    def dragLeaveEvent(self, event: QDragLeaveEvent):
        self.set_normal_style()
        event.accept()

    def dropEvent(self, event: QDropEvent):
        self.set_normal_style()
        urls = event.mimeData().urls()
        paths = [url.toLocalFile() for url in urls if url.isLocalFile()]
        if paths:
            self.files_dropped.emit(paths)
        event.acceptProposedAction()

    # Mouse events for Click-to-Browse
    def mousePressEvent(self, event):
        if event.button() == Qt.MouseButton.LeftButton:
            self.clicked.emit()
            event.accept()
        else:
            super().mousePressEvent(event)


class ImageTableWidget(QTableWidget):
    """
    A custom QTableWidget tailored for showing conversion progress and stats.
    Includes contextual menus for item removal and quick operations.
    """
    remove_requested = pyqtSignal(list) # Emits list of row indexes to remove
    clear_all_requested = pyqtSignal()
    open_folder_requested = pyqtSignal(str) # Emits file path

    def __init__(self, parent=None):
        # 5 columns: Name, Path (Hidden), Resolution, Size, Status
        super().__init__(0, 5, parent)
        self.setHorizontalHeaderLabels(["File Name", "Path", "Resolution", "File Size", "Status"])
        self.setSelectionBehavior(QAbstractItemView.SelectionBehavior.SelectRows)
        self.setSelectionMode(QAbstractItemView.SelectionMode.ExtendedSelection)
        self.setEditTriggers(QAbstractItemView.EditTrigger.NoEditTriggers)
        
        # Adjust headers
        self.horizontalHeader().setSectionResizeMode(0, QHeaderView.ResizeMode.Stretch)
        # Hide Path column (index 1) but keep it in data for quick access
        self.setColumnHidden(1, True)
        self.horizontalHeader().setSectionResizeMode(2, QHeaderView.ResizeMode.Interactive)
        self.horizontalHeader().setSectionResizeMode(3, QHeaderView.ResizeMode.Interactive)
        self.horizontalHeader().setSectionResizeMode(4, QHeaderView.ResizeMode.Interactive)
        
        self.horizontalHeader().resizeSection(2, 120)
        self.horizontalHeader().resizeSection(3, 140)
        self.horizontalHeader().resizeSection(4, 150)

        # Context Menu
        self.setContextMenuPolicy(Qt.ContextMenuPolicy.CustomContextMenu)
        self.customContextMenuRequested.connect(self.show_context_menu)

    def show_context_menu(self, pos):
        selected_ranges = self.selectedRanges()
        if not selected_ranges:
            return

        menu = QMenu(self)
        menu.setStyleSheet("""
            QMenu {
                background-color: #1e293b;
                border: 1px solid #334155;
                border-radius: 4px;
                padding: 4px;
            }
            QMenu::item {
                padding: 6px 20px;
                color: #f8fafc;
            }
            QMenu::item:selected {
                background-color: #4f46e5;
                border-radius: 2px;
            }
        """)

        remove_action = menu.addAction("Remove Selected Files")
        clear_action = menu.addAction("Clear All Files")
        
        # If single file selected, show open containing folder
        selected_rows = self.get_selected_rows()
        open_folder_action = None
        if len(selected_rows) == 1:
            menu.addSeparator()
            open_folder_action = menu.addAction("Open Containing Folder")

        action = menu.exec(self.mapToGlobal(pos))
        if action == remove_action:
            self.remove_requested.emit(selected_rows)
        elif action == clear_action:
            self.clear_all_requested.emit()
        elif open_folder_action and action == open_folder_action:
            file_path = self.item(selected_rows[0], 1).text()
            self.open_folder_requested.emit(file_path)

    def get_selected_rows(self):
        """
        Returns sorted list of selected row indices.
        """
        rows = set()
        for index in self.selectedIndexes():
            rows.add(index.row())
        return sorted(list(rows))
