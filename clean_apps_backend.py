"""
CleanSweep — Advanced Windows App Cleanup
Gracefully closes user applications and optionally force-kills them.
Preserves system-critical and whitelisted processes.
"""

from __future__ import annotations

import logging
import os
import platform
import subprocess
import sys
from dataclasses import dataclass, field
from typing import List, Optional, Set, Tuple

# ================= PUBLIC API =================

__all__ = [
    "DRY_RUN",
    "FORCE_KILL_AFTER_TIMEOUT",
    "GRACEFUL_TIMEOUT_SECONDS",
    "REQUIRE_CONFIRMATION",
    "WINDOWS_WHITELIST",
    "CleanupResult",
    "add_to_whitelist",
    "get_current_whitelist",
    "discover_targets_windows",
    "cleanup_windows",
]

# ================= DEPENDENCY BOOTSTRAP =================

_REQUIRED_PACKAGES = ("psutil",)


def _ensure_dependencies() -> None:
    """Check for required packages and install any that are missing."""
    missing: list[str] = []
    for package in _REQUIRED_PACKAGES:
        try:
            __import__(package)
        except ImportError:
            missing.append(package)

    if not missing:
        return

    print(f"[SETUP] Missing packages detected: {', '.join(missing)}")
    print("[SETUP] Installing missing packages...")

    for package in missing:
        try:
            subprocess.check_call(
                [sys.executable, "-m", "pip", "install", package],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.PIPE,
            )
            print(f"[SETUP] Successfully installed: {package}")
        except subprocess.CalledProcessError as e:
            print(f"[SETUP] ERROR: Failed to install '{package}': {e}")
            print("[SETUP] Please install it manually:  pip install " + package)
            sys.exit(1)
        except FileNotFoundError:
            print("[SETUP] ERROR: pip is not available. Please install pip first.")
            sys.exit(1)

    # Re-verify after installation
    for package in missing:
        try:
            __import__(package)
        except ImportError:
            print(f"[SETUP] ERROR: '{package}' installed but still cannot be imported.")
            sys.exit(1)

    print("[SETUP] All dependencies are ready.\n")


# Run dependency check before any other imports that need them
_ensure_dependencies()

# --------------- Safe to import psutil now ---------------
import psutil  # noqa: E402

# ================= CONFIGURATION =================

DRY_RUN: bool = False                          # Preview without killing anything
FORCE_KILL_AFTER_TIMEOUT: bool = True          # Force-kill if graceful close times out
GRACEFUL_TIMEOUT_SECONDS: int = 5              # Seconds to wait for a graceful close
FORCE_KILL_TIMEOUT_SECONDS: int = 3            # Seconds to wait after force-kill
REQUIRE_CONFIRMATION: bool = True              # Ask user before proceeding

# Log file next to the script (fallback to cwd if __file__ is unavailable)
try:
    _script_dir = os.path.dirname(os.path.abspath(__file__))
except NameError:
    _script_dir = os.getcwd()
LOG_FILE: str = os.path.join(_script_dir, "cleansweep.log")


# =====================================================================
#  Structured result
# =====================================================================

@dataclass
class CleanupResult:
    """Result of a cleanup run. Truthy when no failures occurred."""

    success_count: int = 0
    fail_count: int = 0
    total: int = 0

    def __bool__(self) -> bool:
        return self.fail_count == 0


# =====================================================================
#  Platform-specific protected & whitelisted process lists
# =====================================================================

# --- Windows (immutable – never modified at runtime) ---
WINDOWS_PROTECTED_PROCESSES: frozenset[str] = frozenset({
    "system", "registry", "smss", "csrss", "wininit", "services", "lsass",
    "svchost", "explorer", "taskhostw", "searchindexer",
    "securityhealthservice", "msmpeng", "runtimebroker",
    "dwm", "fontdrvhost", "winlogon", "sihost", "ctfmon",
    "conhost", "dllhost", "audiodg", "shellexperiencehost",
    "startmenuexperiencehost", "searchhost", "textinputhost",
    "systemsettings", "lockapp", "applicationframehost",
    "spoolsv", "wudfhost", "dashost",
})

WINDOWS_WHITELIST: set[str] = {
    "code",                # VS Code
    "windowsterminal",     # Windows Terminal
    "docker desktop",      # Docker Desktop
    "idea64",              # IntelliJ IDEA
    "clean_apps_gui",      # This GUI (script mode)
    "cleansweep",          # This GUI (compiled mode)
    "qoder",               # Qoder IDE
    "memcompression",      # Memory Compression
}


# ================= LOGGING (idempotent) =================

logger: logging.Logger = logging.getLogger("cleansweep")

if not logger.handlers:
    _file_handler = logging.FileHandler(LOG_FILE, encoding="utf-8")
    _file_handler.setFormatter(logging.Formatter("%(asctime)s [%(levelname)s] %(message)s"))

    _console_handler = logging.StreamHandler(sys.stdout)
    _console_handler.setFormatter(logging.Formatter("%(message)s"))

    logger.setLevel(logging.INFO)
    logger.addHandler(_file_handler)
    logger.addHandler(_console_handler)


def log(msg: str, level: int = logging.INFO) -> None:
    """Log a message to both console and file."""
    logger.log(level, msg)


# =====================================================================
#                          WINDOWS BACKEND
# =====================================================================

# ---------- Win32 helpers (cached at module level) ----------

_WM_CLOSE: int = 0x0010

if platform.system() == "Windows":
    import ctypes
    from ctypes import wintypes

    _user32 = ctypes.windll.user32  # type: ignore[attr-defined]
    _EnumWindows = _user32.EnumWindows
    _EnumWindowsProc = ctypes.WINFUNCTYPE(ctypes.c_bool, wintypes.HWND, wintypes.LPARAM)
    _GetWindowThreadProcessId = _user32.GetWindowThreadProcessId
    _PostMessageW = _user32.PostMessageW
    _IsWindow = _user32.IsWindow
else:
    # Stubs so the module can be imported on non-Windows for testing
    ctypes = None  # type: ignore[assignment]
    wintypes = None  # type: ignore[assignment]


def _win_is_admin() -> bool:
    """Return True if the script is running with Administrator privileges."""
    try:
        import ctypes as _ct
        return bool(_ct.windll.shell32.IsUserAnAdmin())  # type: ignore[attr-defined]
    except Exception:
        return False


def _win_close_process_windows(pid: int) -> int:
    """Send WM_CLOSE to every top-level window owned by *pid*.

    Returns the number of windows that received the message.
    """
    if pid <= 0 or platform.system() != "Windows":
        return 0

    closed_count = 0

    def callback(hwnd: int, _lparam: int) -> bool:
        nonlocal closed_count
        if not _IsWindow(hwnd):
            return True
        proc_id = wintypes.DWORD()
        _GetWindowThreadProcessId(hwnd, ctypes.byref(proc_id))
        if proc_id.value == pid:
            _PostMessageW(hwnd, _WM_CLOSE, 0, 0)
            closed_count += 1
        return True

    try:
        _EnumWindows(_EnumWindowsProc(callback), 0)
    except OSError:
        pass

    return closed_count


def _normalize_win(name: str) -> str:
    """Normalise a Windows process name for comparison."""
    return name.lower().replace(".exe", "").strip()


def _is_whitelisted_win(pname: str) -> bool:
    """Check if *pname* (already normalised) matches a whitelist entry.

    Uses exact-match for speed and safety. Substring matching was removed
    because it caused false positives (e.g. ``"code"`` matching ``"codec"``).
    """
    return pname in WINDOWS_WHITELIST


def add_to_whitelist(process_names: list[str]) -> int:
    """Add process names to the whitelist dynamically."""
    added = 0
    for name in process_names:
        normalised = _normalize_win(name)
        if normalised not in WINDOWS_WHITELIST:
            WINDOWS_WHITELIST.add(normalised)
            added += 1
    return added


def get_current_whitelist() -> list[str]:
    """Return the current whitelist sorted alphabetically."""
    return sorted(WINDOWS_WHITELIST)


def _safe_name(proc: psutil.Process, cached_name: Optional[str] = None) -> str:
    """Return the best available display name for a process."""
    if cached_name:
        return cached_name
    try:
        return proc.name()
    except (psutil.NoSuchProcess, psutil.AccessDenied):
        return f"<PID {proc.pid}>"


# =====================================================================
#  Process discovery
# =====================================================================

def discover_targets_windows() -> list[tuple[psutil.Process, str]]:
    """Return a list of ``(process, cached_name)`` tuples for user apps on Windows."""
    targets: list[tuple[psutil.Process, str]] = []
    my_pid = os.getpid()

    # Also exclude the direct parent (terminal / IDE running this script)
    try:
        parent_pid = psutil.Process(my_pid).ppid()
    except (psutil.NoSuchProcess, psutil.AccessDenied):
        parent_pid = -1

    # Request 'status' up-front so we don't need a separate syscall later
    for proc in psutil.process_iter(["pid", "name", "status"]):
        try:
            name = proc.info["name"]
            if not isinstance(name, str) or not name:
                continue

            pname = _normalize_win(name)

            if pname in WINDOWS_PROTECTED_PROCESSES:
                continue
            if _is_whitelisted_win(pname):
                continue
            if proc.pid <= 4 or proc.pid == my_pid or proc.pid == parent_pid:
                continue
            if proc.info.get("status") == psutil.STATUS_ZOMBIE:
                continue

            targets.append((proc, name))
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            continue

    return targets


# =====================================================================
#  Cleanup execution
# =====================================================================

def cleanup_windows(
    targets: Optional[list[tuple[psutil.Process, str]]] = None,
) -> CleanupResult:
    """Run cleanup on Windows.

    Returns a :class:`CleanupResult` (truthy when ``fail_count == 0``).
    """
    log("========================================")
    log(" CleanSweep — Windows App Cleanup")
    log("========================================")

    if not _win_is_admin():
        log("⚠  You are not running as Administrator. Some processes may not be closable.")
        log("   Consider re-running this script as Administrator.\n")

    if DRY_RUN:
        log("MODE: Dry-run enabled — no processes will be killed.")

    if targets is None:
        targets = discover_targets_windows()

    result = CleanupResult(total=len(targets))

    if not targets:
        log("No user applications found to clean up.")
        return result

    log(f"\nFound {result.total} target process(es):")
    for proc, cached_name in targets:
        log(f"  • {cached_name} (PID {proc.pid})")

    if REQUIRE_CONFIRMATION and not DRY_RUN:
        log("")
        try:
            answer = input("Proceed with cleanup? [y/N]: ").strip().lower()
        except (EOFError, KeyboardInterrupt):
            answer = "n"
        if answer not in ("y", "yes"):
            log("Aborted by user.")
            return result

    for proc, cached_name in targets:
        display = _safe_name(proc, cached_name)
        try:
            log(f"\nAttempting graceful close: {display} (PID {proc.pid})")

            if DRY_RUN:
                log(f"  DRY-RUN: Skipped {display}")
                continue

            windows_closed = _win_close_process_windows(proc.pid)
            if windows_closed == 0:
                proc.terminate()

            proc.wait(timeout=GRACEFUL_TIMEOUT_SECONDS)
            log(f"  ✓ Closed successfully: {display}")
            result.success_count += 1

        except psutil.TimeoutExpired:
            if FORCE_KILL_AFTER_TIMEOUT:
                log(f"  Timeout — force killing: {display}")
                try:
                    proc.kill()
                    proc.wait(timeout=FORCE_KILL_TIMEOUT_SECONDS)
                    log(f"  ✓ Force-killed: {display}")
                    result.success_count += 1
                except psutil.NoSuchProcess:
                    log(f"  ✓ Already exited: {display}")
                    result.success_count += 1
                except Exception as e:
                    log(f"  ✗ ERROR force killing {display}: {e}", level=logging.ERROR)
                    result.fail_count += 1
            else:
                log(f"  ⏭ Timeout reached, skipped force kill: {display}")
                result.fail_count += 1

        except psutil.NoSuchProcess:
            log(f"  ✓ Already exited: {display}")
            result.success_count += 1

        except psutil.AccessDenied:
            log(
                f"  ✗ Access denied for {display} — try running as Administrator.",
                level=logging.WARNING,
            )
            result.fail_count += 1

        except Exception as e:
            log(f"  ✗ ERROR handling {display}: {e}", level=logging.ERROR)
            result.fail_count += 1

    log("\n========================================")
    log(" Cleanup completed")
    log(f"   Closed: {result.success_count}   |   Failed/Skipped: {result.fail_count}")
    log(" System & whitelisted processes preserved")
    log("========================================")

    return result


# =====================================================================
#                              MAIN
# =====================================================================

def main() -> None:
    """Main entry point for command-line execution."""
    log("\n╔══════════════════════════════════════════╗")
    log("║         CleanSweep Utility               ║")
    log("╚══════════════════════════════════════════╝\n")

    if platform.system() != "Windows":
        log("Error: This script is intended for use on Windows.")
        return

    cleanup_windows()


# ================= ENTRY =================

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        log("\nInterrupted by user (Ctrl+C). Exiting.")
    except Exception as exc:
        log(f"FATAL: Unhandled exception: {exc}", level=logging.CRITICAL)
        raise
