# 🧹 CleanSweep — Advanced Multi-Platform App Cleanup

> **Gracefully close user applications across Windows, Android, and iOS — while preserving system-critical and whitelisted processes.**

---

## 📖 Overview

`clean-apps.py` (now branded as **CleanSweep**) is a Python utility that safely cleans up running user applications on **three platforms**:

| Platform | Method | Requirements |
| --- | --- | --- |
| **Windows 11/10** | Direct process management via `psutil` + Win32 API | Administrator privileges |
| **Android** | Android Debug Bridge (`adb`) over USB | ADB installed, device connected & authorized |
| **iOS** | `tidevice` or `libimobiledevice` over USB | Tool installed, device connected & trusted |

The script auto-detects which platforms are available and lets you choose.

### Ideal For

- 🔄 Freeing up system resources before heavy workloads
- 🧼 Performing a quick device "spring clean" without a full restart
- ⚙️ Automating environment reset in development workflows
- 📱 Closing all background apps on your phone from your PC

---

## ✨ Features

| Feature | Windows | Android | iOS |
| --- | --- | --- | --- |
| **Graceful Close** | `WM_CLOSE` messages | `am force-stop` | `tidevice kill` / `idevicedebug kill` |
| **Force Kill Fallback** | `psutil.kill()` | N/A (force-stop is immediate) | N/A |
| **System Protection** | 30+ protected processes | Core Android packages | All `com.apple.*` bundles |
| **Whitelist Support** | ✅ | ✅ | ✅ |
| **Dry-Run Mode** | ✅ | ✅ | ✅ |
| **User Confirmation** | ✅ | ✅ | ✅ |
| **Clear App Cache** | — | ✅ (optional prompt) | — |
| **Device Info Display** | — | Model + Android version | Model + iOS version |
| **Auto Dependency Install** | ✅ (`psutil`) | — | — |
| **Dual Logging** | ✅ | ✅ | ✅ |

---

## 📋 Prerequisites

### Common

| Requirement | Details |
| --- | --- |
| **Python** | Python 3.10 or later |
| **pip** | Required for automatic dependency installation |

### Windows

| Requirement | Details |
| --- | --- |
| **OS** | Windows 11 (also works on Windows 10) |
| **Privileges** | Recommended to run as Administrator |

### Android

| Requirement | Details |
| --- | --- |
| **ADB** | Android Debug Bridge installed and on PATH |
| **USB Debugging** | Enabled on the device (Settings → Developer options → USB debugging) |
| **Device** | Connected via USB cable and authorized |

### iOS

| Requirement | Details |
| --- | --- |
| **Tool** | One of: `tidevice` (`pip install tidevice`) or `libimobiledevice` |
| **Trust** | Device connected via USB and the "Trust This Computer" prompt accepted |

---

## 🚀 Installation

1. **Clone or download** the script:

   ```bash
   git clone <your-repo-url>
   ```

   Or simply copy `clean-apps.py` to a directory of your choice.

2. **Python dependencies** are handled automatically. On first run, the script installs `psutil` if missing. You can also install manually:

   ```bash
   pip install psutil
   ```

3. **Platform tools** (install only the ones you need):

   ```bash
   # Android – install ADB
   # Windows: download from https://developer.android.com/studio/releases/platform-tools
   # macOS:   brew install android-platform-tools
   # Linux:   sudo apt install adb

   # iOS – install tidevice (recommended)
   pip install tidevice

   # iOS – or install libimobiledevice
   # macOS:   brew install libimobiledevice
   # Linux:   sudo apt install libimobiledevice-utils
   ```

---

## 🖥️ Usage

### Running the Script

```bash
python clean-apps.py
```

The script will auto-detect available platforms and display a selection menu:

```
╔══════════════════════════════════════════╗
║        CleanSweep Cleanup Utility        ║
╚══════════════════════════════════════════╝

Available platforms:

  [1] Windows (local machine)
  [2] Android — Pixel 7 (Android 14)
  [3] iOS — iPhone15,2 (iOS 17.2)

Select platform [1-3]:
```

If only one platform is detected, it is auto-selected.

### Windows Example Output

```
========================================
 CleanSweep — Windows App Cleanup
========================================

Found 12 target process(es):
  • Notepad.exe (PID 11234)
  • Spotify.exe (PID 9122)
  • Discord.exe (PID 7890)
  ...

Proceed with cleanup? [y/N]: y

Attempting graceful close: Notepad.exe (PID 11234)
  ✓ Closed successfully: Notepad.exe

Attempting graceful close: Spotify.exe (PID 9122)
  Timeout — force killing: Spotify.exe
  ✓ Force-killed: Spotify.exe

========================================
 Cleanup completed
   Closed: 10   |   Failed/Skipped: 2
 System & whitelisted processes preserved
========================================
```

### Android Example Output

```
========================================
 Advanced Android App Cleanup (via ADB)
 Device: Pixel 7 (Android 14)
========================================

Found 8 target app(s):
  • com.spotify.music
  • com.discord
  • com.whatsapp
  ...

Proceed with Android cleanup? [y/N]: y

Force-stopping: com.spotify.music
  ✓ Force-stopped: com.spotify.music
  ...

Also clear cached data for stopped apps? [y/N]: n

========================================
 Android Cleanup completed
   Stopped: 8   |   Failed/Skipped: 0
 System & whitelisted packages preserved
========================================
```

### iOS Example Output

```
========================================
 Advanced iOS App Cleanup (via tidevice)
 Device: iPhone15,2 (iOS 17.2)
========================================

Found 5 target app(s):
  • com.spotify.client
  • com.burbn.instagram
  ...

Proceed with iOS cleanup? [y/N]: y

Terminating: com.spotify.client
  ✓ Terminated: com.spotify.client
  ...

========================================
 iOS Cleanup completed
   Terminated: 5   |   Failed/Skipped: 0
 System & whitelisted apps preserved
========================================
```

---

## ⚙️ Configuration

All configuration options are defined as constants near the top of the script:

```python
DRY_RUN = False                     # Set True to preview without killing anything
FORCE_KILL_AFTER_TIMEOUT = True     # Force-kill if graceful close times out
GRACEFUL_TIMEOUT_SECONDS = 5        # Seconds to wait for a graceful close
REQUIRE_CONFIRMATION = True         # Ask user before proceeding
```

| Variable | Type | Default | Description |
| --- | --- | --- | --- |
| `DRY_RUN` | `bool` | `False` | Lists targets but does **not** terminate any. |
| `FORCE_KILL_AFTER_TIMEOUT` | `bool` | `True` | Force-kills Windows processes that don't exit in time. |
| `GRACEFUL_TIMEOUT_SECONDS` | `int` | `5` | Grace period before force killing (Windows only). |
| `REQUIRE_CONFIRMATION` | `bool` | `True` | Prompt for confirmation before each cleanup. |

### Protected Processes / Packages

Each platform has its own set of protected system processes that are **never** touched:

- **Windows:** `WINDOWS_PROTECTED_PROCESSES` — 30+ core services (`csrss`, `lsass`, `explorer`, etc.)
- **Android:** `ANDROID_PROTECTED_PACKAGES` — System packages (`com.android.systemui`, `com.google.android.gms`, etc.)
- **iOS:** `IOS_PROTECTED_BUNDLES` — System bundles (`com.apple.springboard`, etc.) + all `com.apple.*` apps

> ⚠️ **Warning:** Do **not** remove entries from the protected sets unless you fully understand the consequences.

### Whitelists

Each platform has a separate whitelist set. Add app identifiers to keep them alive during cleanup:

```python
# Windows: process name (lowercase, no .exe)
WINDOWS_WHITELIST = {"code", "windowsterminal", "docker desktop", "idea64"}

# Android: package name
ANDROID_WHITELIST = {"com.android.adb", "com.termux"}

# iOS: bundle ID
IOS_WHITELIST = set()  # Add your apps here
```

---

## 🔍 How It Works

```
┌──────────────────────┐
│  1. Bootstrap Deps   │  Installs missing Python packages
└─────────┬────────────┘
          ▼
┌──────────────────────┐
│  2. Detect Platforms │  Checks Windows, ADB, iOS tools
└─────────┬────────────┘
          ▼
┌──────────────────────┐
│  3. Platform Menu    │  User selects target platform
└─────────┬────────────┘
          ▼
┌──────────────────────┐
│  4. Discover Targets │  Platform-specific process enumeration
│                      │  filtering protected & whitelisted
└─────────┬────────────┘
          ▼
┌──────────────────────┐
│  5. User Confirm     │  Displays target list, asks approval
└─────────┬────────────┘
          ▼
┌──────────────────────┐
│  6. Close / Kill     │  Platform-specific termination
└─────────┬────────────┘
          ▼
┌──────────────────────┐
│  7. Summary Report   │  Logs results to console + file
└──────────────────────┘
```

### Platform-Specific Details

| Step | Windows | Android | iOS |
| --- | --- | --- | --- |
| **Discovery** | `psutil.process_iter()` | `adb shell ps -A` + `dumpsys activity recents` | `tidevice applist` / `ideviceinstaller -l` |
| **Graceful Close** | `WM_CLOSE` via Win32 API | — | — |
| **Terminate** | `proc.terminate()` | `adb shell am force-stop` | `tidevice kill` / `idevicedebug kill` |
| **Force Kill** | `proc.kill()` | — | — |

---

## 🛡️ Safety Mechanisms

| Mechanism | Platforms | Purpose |
| --- | --- | --- |
| Protected process/package lists | All | Prevents termination of critical system services |
| Whitelist | All | Preserves user-specified applications |
| Self-exclusion | Windows | Script never kills its own Python process |
| Low-PID filter | Windows | Skips PIDs ≤ 4 (System Idle, System) |
| Zombie filter | Windows | Skips zombie processes |
| Admin check | Windows | Warns if not running elevated |
| Dry-run mode | All | Safe preview of targets |
| Confirmation prompt | All | Requires explicit user approval |
| Graceful-first approach | Windows | Tries `WM_CLOSE` before force killing |
| Apple bundle filter | iOS | Skips all `com.apple.*` system bundles |
| Android system filter | Android | Skips `android.*` and internal system packages |

---

## 📝 Logging

All output is logged to **two destinations** simultaneously:

1. **Console** — Clean, human-readable messages.
2. **Log File** — `cleansweep.log` in the same directory as the script, with timestamps and log levels.

---

## 🛠️ Troubleshooting

| Problem | Solution |
| --- | --- |
| `"No platforms detected"` | Ensure you're on Windows and/or have ADB/tidevice installed with a device connected |
| `Access denied` (Windows) | Right-click your terminal → **Run as Administrator** |
| `"pip is not available"` | Install pip: `python -m ensurepip --upgrade` |
| ADB device not listed | Enable USB debugging on phone, re-connect USB cable, accept trust prompt |
| iOS device not detected | Accept "Trust This Computer" on your iPhone/iPad |
| Wanted app got closed | Add the app to the appropriate whitelist set in the script |

---

## 📂 Project Structure

```
Clean-apps/
├── clean-apps.py       # Main multi-platform cleanup script
├── cleansweep.log      # Log file (auto-generated on first run)
└── README.md           # This documentation
```

---

## 📄 License

This project is provided as-is for personal and educational use. Feel free to modify and distribute.

---

<p align="center"><em>CleanSweep — Made with 🐍 Python. Stay clean across all your devices.</em></p>
#   C l e a n S w e e p  
 