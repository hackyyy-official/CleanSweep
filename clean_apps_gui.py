import sys
import os
import psutil
import logging
from PySide6.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout, 
                             QHBoxLayout, QLabel, QPushButton, QListWidget, 
                             QTextEdit, QCheckBox, QListWidgetItem, 
                             QFrame, QMessageBox)
from PySide6.QtCore import Qt, QThread, Signal, Slot, QSize
from PySide6.QtGui import QColor, QPalette, QFont, QIcon, QBrush

# Import the backend logic
try:
    import clean_apps_backend as clean_apps
except ImportError:
    # If not in path, try adding current dir
    sys.path.append(os.path.dirname(os.path.abspath(__file__)))
    try:
        import clean_apps_backend as clean_apps
    except ImportError:
        # Should not happen in this environment but good for robustness
        print("Error: clean_apps_backend.py not found.")
        sys.exit(1)

# ================= THEME CONFIGURATION =================
THEME = {
    "Primary": "#2563EB",
    "PrimaryDark": "#1E40AF",
    "Background": "#0F172A",
    "Surface": "#111827",
    "Card": "#1F2933",
    "TextPrimary": "#E5E7EB",
    "TextSecondary": "#9CA3AF",
    "TextMuted": "#6B7280",
    "Success": "#22C55E",
    "Warning": "#F59E0B",
    "Error": "#EF4444",
    "Info": "#38BDF8",
}

STYLESHEET = f"""
QMainWindow {{
    background-color: {THEME['Background']};
    color: {THEME['TextPrimary']};
}}
QWidget {{
    font-family: 'Segoe UI', 'Roboto', sans-serif;
    font-size: 14px;
    color: {THEME['TextPrimary']};
}}
QTabWidget::pane {{
    border: 1px solid {THEME['Card']};
    background: {THEME['Surface']};
    border-radius: 4px;
}}
QTabBar::tab {{
    background: {THEME['Card']};
    color: {THEME['TextSecondary']};
    padding: 10px 20px;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
    margin-right: 2px;
}}
QTabBar::tab:selected {{
    background: {THEME['Primary']};
    color: white;
    font-weight: bold;
}}
QListWidget {{
    background-color: {THEME['Surface']};
    border: 1px solid {THEME['Card']};
    border-radius: 6px;
    outline: none;
}}
QListWidget::item {{
    padding: 10px;
    border-bottom: 1px solid {THEME['Card']};
}}
QListWidget::item:selected {{
    background-color: {THEME['PrimaryDark']};
    color: white;
    border-radius: 4px;
}}
QListWidget::item:hover {{
    background-color: {THEME['Card']};
}}
QTextEdit {{
    background-color: {THEME['Surface']};
    border: 1px solid {THEME['Card']};
    color: {THEME['TextSecondary']};
    font-family: 'Consolas', monospace;
    border-radius: 6px;
    padding: 5px;
}}
QPushButton {{
    background-color: {THEME['Primary']};
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    font-weight: bold;
}}
QPushButton:hover {{
    background-color: {THEME['PrimaryDark']};
}}
QPushButton:disabled {{
    background-color: {THEME['Card']};
    color: {THEME['TextMuted']};
}}
QLabel {{
    color: {THEME['TextPrimary']};
}}
QCheckBox {{
    color: {THEME['TextPrimary']};
    spacing: 8px;
}}
QCheckBox::indicator {{
    width: 18px;
    height: 18px;
    border: 1px solid {THEME['TextSecondary']};
    border-radius: 3px;
    background: {THEME['Surface']};
}}
QCheckBox::indicator:checked {{
    background-color: {THEME['Primary']};
    border-color: {THEME['Primary']};
}}
QProgressBar {{
    border: 1px solid {THEME['Card']};
    border-radius: 4px;
    text-align: center;
    background-color: {THEME['Surface']};
    color: {THEME['TextPrimary']};
}}
QProgressBar::chunk {{
    background-color: {THEME['Success']};
    border-radius: 3px;
}}
"""

class Worker(QThread):
    finished = Signal()
    progress = Signal(str)
    
    def __init__(self, func, *args, **kwargs):
        super().__init__()
        self.func = func
        self.args = args
        self.kwargs = kwargs
        
    def run(self):
        # Redirect log
        original_log = clean_apps.log
        
        def gui_log(msg, level=20):
            self.progress.emit(str(msg))
            # call original log if needed to keep console output
            original_log(msg, level)
        
        # Monkey patch
        clean_apps.log = gui_log
        try:
            self.func(*self.args, **self.kwargs)
        except Exception as e:
            self.progress.emit(f"Error: {e}")
        finally:
            clean_apps.log = original_log
            self.finished.emit()

class AppCleanerWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("CleanSweep | Windows Utility")
        self.resize(900, 650)
        
        # Apply Logic Settings
        clean_apps.REQUIRE_CONFIRMATION = False
        clean_apps.DRY_RUN = False
        
        self.setup_ui()
        
    def setup_ui(self):
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        main_layout = QVBoxLayout(central_widget)
        main_layout.setContentsMargins(24, 24, 24, 24)
        main_layout.setSpacing(20)

        # Header
        header_layout = QHBoxLayout()
        header = QLabel("CleanSweep")
        header.setStyleSheet(f"font-size: 28px; font-weight: bold; color: {THEME['TextPrimary']};")
        header_layout.addWidget(header)
        header_layout.addStretch()
        main_layout.addLayout(header_layout)

        # Main Content Area (Previously Tabs)
        content_frame = QFrame()
        content_frame.setStyleSheet(f"background-color: {THEME['Surface']}; border: 1px solid {THEME['Card']}; border-radius: 8px;")
        content_layout = QVBoxLayout(content_frame)
        content_layout.setContentsMargins(15, 15, 15, 15)
        
        # Action Bar (Refresh, Select All)
        action_bar = QHBoxLayout()
        
        refresh_btn = QPushButton("Refresh List")
        refresh_btn.setStyleSheet(f"background-color: {THEME['Card']}; border: 1px solid {THEME['Primary']};")
        refresh_btn.clicked.connect(self.scan_apps)
        action_bar.addWidget(refresh_btn)
        
        sel_all_btn = QPushButton("Select All")
        sel_all_btn.setStyleSheet(f"background-color: {THEME['Card']}; border: 1px solid {THEME['TextSecondary']};")
        sel_all_btn.clicked.connect(self.select_all)
        action_bar.addWidget(sel_all_btn)
        
        self.whitelist_btn = QPushButton("Whitelist Selected")
        self.whitelist_btn.setStyleSheet(f"background-color: {THEME['Success']}; border: 1px solid {THEME['Success']};")
        self.whitelist_btn.clicked.connect(self.whitelist_selected)
        action_bar.addWidget(self.whitelist_btn)
        
        show_whitelist_btn = QPushButton("Show Whitelist")
        show_whitelist_btn.setStyleSheet(f"background-color: {THEME['Info']}; border: 1px solid {THEME['Info']};")
        show_whitelist_btn.clicked.connect(self.show_whitelist)
        action_bar.addWidget(show_whitelist_btn)
        
        action_bar.addStretch()
        content_layout.addLayout(action_bar)

        # List of apps
        self.list_windows = QListWidget()
        self.list_windows.setSelectionMode(QListWidget.MultiSelection)
        content_layout.addWidget(self.list_windows)
        
        main_layout.addWidget(content_frame)

        # Bottom Controls
        controls_layout = QHBoxLayout()
        
        self.dry_run_chk = QCheckBox("Dry Run Mode (Simulate Only)")
        self.dry_run_chk.setStyleSheet("font-weight: bold;")
        self.dry_run_chk.stateChanged.connect(self.toggle_dry_run)
        controls_layout.addWidget(self.dry_run_chk)
        
        controls_layout.addStretch()
        
        self.clean_btn = QPushButton("Clean Selected")
        self.clean_btn.clicked.connect(self.clean_selected)
        self.clean_btn.setMinimumHeight(45)
        self.clean_btn.setMinimumWidth(150)
        
        controls_layout.addWidget(self.clean_btn)
        
        main_layout.addLayout(controls_layout)

        # Log Area
        log_label = QLabel("Activity Log")
        log_label.setStyleSheet(f"color: {THEME['TextSecondary']}; font-weight: bold; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;")
        main_layout.addWidget(log_label)
        
        self.log_area = QTextEdit()
        self.log_area.setReadOnly(True)
        self.log_area.setMinimumHeight(120)
        self.log_area.setMaximumHeight(200)
        main_layout.addWidget(self.log_area)
        
        # Run initial scan
        QtCore.QTimer.singleShot(500, self.scan_apps)

    def select_all(self):
        self.list_windows.selectAll()
        
    def whitelist_selected(self):
        selected_items = self.list_windows.selectedItems()
        
        if not selected_items:
            self.log("No apps selected to whitelist.")
            return
            
        process_names = []
        for item in selected_items:
            proc_data = item.data(Qt.UserRole)
            if proc_data and len(proc_data) >= 2:
                proc, name = proc_data
                process_names.append(name)
        
        if process_names:
            added_count = clean_apps.add_to_whitelist(process_names)
            if added_count > 0:
                self.log(f"Added {added_count} process(es) to whitelist: {', '.join([clean_apps._normalize_win(name) for name in process_names[:3]])}{('...' if len(process_names) > 3 else '')}")
                self.log("Refreshing process list...")
                self.scan_apps()  # Refresh to show updated whitelist
            else:
                self.log("Selected processes were already in whitelist.")
                
    def show_whitelist(self):
        """Display the current whitelist in a message box."""
        whitelist = clean_apps.get_current_whitelist()
        if whitelist:
            whitelist_text = "\n".join([f"• {item}" for item in whitelist])
            msg = f"Current Whitelist ({len(whitelist)} items):\n\n{whitelist_text}"
        else:
            msg = "Whitelist is empty."
        
        QMessageBox.information(self, "Current Whitelist", msg)

    def toggle_dry_run(self, state):
        clean_apps.DRY_RUN = (state == Qt.Checked)
        state_str = "ENABLED" if clean_apps.DRY_RUN else "DISABLED"
        self.log(f"INFO: Dry Run mode {state_str}")

    def log(self, msg):
        self.log_area.append(msg)
        sb = self.log_area.verticalScrollBar()
        sb.setValue(sb.maximum())

    def scan_apps(self):
        self.list_windows.clear()
        self.clean_btn.setEnabled(False)
        self.log("Scanning windows apps...")
        
        worker = Worker(self._scan_logic_wrapper)
        worker.progress.connect(self.log)
        worker.finished.connect(self._on_scan_finished)
        
        self.app_worker = worker # Keep reference
        worker.start()

    def _scan_logic_wrapper(self):
        try:
            self.current_scan_results = clean_apps.discover_targets_windows()
        except Exception as e:
            self.current_scan_results = []
            clean_apps.log(f"Scan error: {e}", logging.ERROR)

    def _on_scan_finished(self):
        targets = getattr(self, 'current_scan_results', [])
        self.log(f"Found {len(targets)} targets on windows.")
        
        for item in targets:
            proc, name = item
            try:
                display_text = f"{name} (PID: {proc.pid})"
            except:
                display_text = str(item)
            
            widget_item = QListWidgetItem(display_text)
            widget_item.setData(Qt.UserRole, item)
            self.list_windows.addItem(widget_item)
            
        self.clean_btn.setEnabled(True)

    def clean_selected(self):
        selected_items = self.list_windows.selectedItems()
        
        if not selected_items:
            if self.list_windows.count() > 0:
                reply = QMessageBox.question(self, "Clean All?", 
                                           "No apps selected. Clean ALL listed apps?", 
                                           QMessageBox.Yes | QMessageBox.No)
                if reply == QMessageBox.Yes:
                    selected_items = [self.list_windows.item(i) for i in range(self.list_windows.count())]
                else:
                    return
            else:
                self.log("Nothing to clean.")
                return

        targets = [item.data(Qt.UserRole) for item in selected_items]
        
        # Filter out whitelisted processes and show which ones are skipped
        filtered_targets = []
        skipped_processes = []
        
        for proc_data in targets:
            if proc_data and len(proc_data) >= 2:
                proc, name = proc_data
                pname = clean_apps._normalize_win(name)
                if clean_apps._is_whitelisted_win(pname):
                    skipped_processes.append(name)
                else:
                    filtered_targets.append(proc_data)
        
        if skipped_processes:
            self.log(f"Skipped {len(skipped_processes)} whitelisted process(es): {', '.join(skipped_processes)}")
            
        if not filtered_targets:
            self.log("No processes to clean (all selected processes are whitelisted).")
            return
        
        self.log(f"Starting cleanup for {len(filtered_targets)} apps (skipped {len(skipped_processes)} whitelisted)...")
        self.clean_btn.setEnabled(False)
        
        def clean_wrapper():
            # Call cleanup and store result
            try:
                success = clean_apps.cleanup_windows(targets=filtered_targets)
                self._cleanup_successful = success
            except Exception as e:
                self.log(f"Error during cleanup: {e}")
                self._cleanup_successful = False

        worker = Worker(clean_wrapper)
        worker.progress.connect(self.log)
        worker.finished.connect(self._on_clean_finished_logic)
        self.clean_worker = worker
        worker.start()

    def _on_clean_finished_logic(self):
        self.clean_btn.setEnabled(True)
        self.log("Cleanup cycle finished.")
        
        # Show success popup if cleanup was successful
        try:
            if hasattr(self, '_cleanup_successful') and self._cleanup_successful:
                QMessageBox.information(self, "Success", "Cleared Successfully")
                if hasattr(self, '_cleanup_successful'):
                    delattr(self, '_cleanup_successful')
        except Exception as e:
            self.log(f"Warning: Could not show success popup: {e}")
        
        self.scan_apps() # Refresh list

def _resource_path(relative_path: str) -> str:
    """Get the absolute path to a resource, works for dev and PyInstaller."""
    base = getattr(sys, '_MEIPASS', os.path.dirname(os.path.abspath(__file__)))
    return os.path.join(base, relative_path)


if __name__ == "__main__":
    from PySide6 import QtCore
    from PySide6.QtWidgets import QSplashScreen
    from PySide6.QtGui import QPixmap

    app = QApplication(sys.argv)
    app.setStyleSheet(STYLESHEET)

    # Set application icon
    icon_path = _resource_path(os.path.join("logo", "app-icon.png"))
    if os.path.exists(icon_path):
        app.setWindowIcon(QIcon(icon_path))

    # Show splash screen with logo
    splash_image_path = _resource_path(os.path.join("logo", "Picsart_26-02-22_14-28-41-204.png"))
    if os.path.exists(splash_image_path):
        pixmap = QPixmap(splash_image_path)
        # Scale to a reasonable splash size while keeping aspect ratio
        pixmap = pixmap.scaled(400, 400, Qt.KeepAspectRatio, Qt.SmoothTransformation)
        splash = QSplashScreen(pixmap, Qt.WindowStaysOnTopHint)
        splash.show()
        app.processEvents()
    else:
        splash = None

    # Create the main window (this is the "loading" work)
    window = AppCleanerWindow()

    # Close splash and show main window
    if splash:
        splash.finish(window)

    window.show()
    sys.exit(app.exec())
