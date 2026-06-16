import time
from PyQt6.QtCore import QRunnable, QObject, pyqtSignal, QThread
from converter_logic import convert_png_to_webp

class WorkerSignals(QObject):
    """
    Defines the signals available from a running worker thread.
    """
    started = pyqtSignal(str)  # Emits: src_path
    finished = pyqtSignal(str, bool, str, int, float, int, int)  # Emits: src_path, success, message, output_size_bytes, duration, width, height

class ConversionWorker(QRunnable):
    """
    Worker thread runnable for converting images to WebP.
    Inherits from QRunnable to handle worker thread setup, signals, and control.
    """
    def __init__(self, src_path, dest_path, quality=85, lossless=False, preserve_transparency=True, overwrite=True):
        super().__init__()
        self.src_path = src_path
        self.dest_path = dest_path
        self.quality = quality
        self.lossless = lossless
        self.preserve_transparency = preserve_transparency
        self.overwrite = overwrite
        self.signals = WorkerSignals()

    def run(self):
        # Notify the UI that conversion has started for this file
        self.signals.started.emit(self.src_path)
        
        start_time = time.perf_counter()
        
        try:
            # Perform the image conversion and get dimensions
            success, message, output_size, width, height = convert_png_to_webp(
                src_path=self.src_path,
                dest_path=self.dest_path,
                quality=self.quality,
                lossless=self.lossless,
                preserve_transparency=self.preserve_transparency,
                overwrite=self.overwrite
            )
        except Exception as e:
            success = False
            message = f"Unexpected thread error: {str(e)}"
            output_size = 0
            width, height = 0, 0
            
        duration = time.perf_counter() - start_time
        
        # Emit results back to UI thread (includes width and height)
        self.signals.finished.emit(self.src_path, success, message, output_size, duration, width, height)

class FileScannerSignals(QObject):
    progress = pyqtSignal(int, int) # Current, Total
    finished = pyqtSignal(list)     # Emits list of file_entry dicts

class FileScannerWorker(QThread):
    def __init__(self, paths):
        super().__init__()
        self.paths = paths
        self.signals = FileScannerSignals()
        self.is_cancelled = False

    def run(self):
        from converter_logic import scan_directory
        import os
        import time

        image_to_add = []
        for path in self.paths:
            if self.is_cancelled:
                return
            path = os.path.normpath(path)
            if os.path.isdir(path):
                scanned = scan_directory(path)
                image_to_add.extend(scanned)
            elif os.path.isfile(path):
                ext = os.path.splitext(path)[1].lower()
                if ext in ('.png', '.jpg', '.jpeg', '.bmp', '.tiff'):
                    image_to_add.append(path)

        total_files = len(image_to_add)
        results = []
        last_emit_time = 0.0

        for idx, file_path in enumerate(image_to_add):
            if self.is_cancelled:
                return

            current_time = time.perf_counter()
            # Rate limit progress signals to 50ms intervals to prevent UI flooding
            if current_time - last_emit_time > 0.05 or idx == total_files - 1:
                self.signals.progress.emit(idx + 1, total_files)
                last_emit_time = current_time

            try:
                file_size = os.path.getsize(file_path)
            except:
                file_size = 0

            # Instant load: width & height are None here; loaded on conversion
            file_entry = {
                "src_path": file_path,
                "width": None,
                "height": None,
                "size": file_size,
                "status": "Pending",
                "webp_size": 0,
                "error_msg": ""
            }
            results.append(file_entry)

        self.signals.finished.emit(results)
