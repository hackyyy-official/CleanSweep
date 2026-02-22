import sys
import subprocess
import os
import json
import hashlib


# ================= CONFIGURATION =================

APP_NAME = "CleanSweep"
COMPANY_NAME = ""
FILE_DESCRIPTION = "CleanSweep — Advanced Windows App Cleanup Utility"
COPYRIGHT = "Copyright © 2026"
SCRIPT_NAME = "clean_apps_gui.py"
ICON_PATH = os.path.join("logo", "app-icon.ico")
VERSION_FILE = "version.json"
VERSION_INFO_FILE = "version_info.txt"

# Source files to track for change detection
TRACKED_FILES = [
    "clean_apps_backend.py",
    "clean_apps_gui.py",
]


# ================= VERSIONING =================

def _file_hash(filepath: str) -> str:
    """Compute SHA-256 hash of a file's contents."""
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()


def _load_version_data() -> dict:
    """Load version.json, or return defaults if missing."""
    if os.path.exists(VERSION_FILE):
        with open(VERSION_FILE, "r") as f:
            return json.load(f)
    return {"version": "1.0", "file_hashes": {}}


def _save_version_data(data: dict) -> None:
    """Persist version data to version.json."""
    with open(VERSION_FILE, "w") as f:
        json.dump(data, f, indent=4)


def _increment_version(version: str) -> str:
    """Increment minor version:  1.0 -> 1.1 -> 1.2 ..."""
    major, minor = version.split(".")
    return f"{major}.{int(minor) + 1}"


def resolve_version() -> str:
    """Compare tracked file hashes with stored hashes.

    - If ANY source file changed -> increment version and save new hashes.
    - If nothing changed          -> keep current version.
    Returns the resolved version string.
    """
    data = _load_version_data()
    current_version = data.get("version", "1.0")
    stored_hashes = data.get("file_hashes", {})

    current_hashes = {}
    changed = False

    for fpath in TRACKED_FILES:
        if os.path.exists(fpath):
            current_hashes[fpath] = _file_hash(fpath)
            if stored_hashes.get(fpath) != current_hashes[fpath]:
                changed = True
        else:
            print(f"  Warning: tracked file '{fpath}' not found, skipping.")

    if not stored_hashes:
        # First build — record hashes, keep version at 1.0
        print(f"  First build detected. Setting version to {current_version}")
        data["file_hashes"] = current_hashes
        _save_version_data(data)
        return current_version

    if changed:
        new_version = _increment_version(current_version)
        print(f"  Source changes detected! Version: {current_version} -> {new_version}")
        data["version"] = new_version
        data["file_hashes"] = current_hashes
        _save_version_data(data)
        return new_version
    else:
        print(f"  No source changes. Version stays at {current_version}")
        return current_version


# ================= VERSION INFO FILE =================

def _generate_version_info(version: str) -> str:
    """Create a PyInstaller version-info .txt file for Windows exe metadata."""
    parts = version.split(".")
    major = int(parts[0])
    minor = int(parts[1]) if len(parts) > 1 else 0

    return f"""\
# UTF-8
#
# For more details about fixed file info 'ffi' see:
# http://msdn.microsoft.com/en-us/library/ms646997.aspx
VSVersionInfo(
  ffi=FixedFileInfo(
    filevers=({major}, {minor}, 0, 0),
    prodvers=({major}, {minor}, 0, 0),
    mask=0x3f,
    flags=0x0,
    OS=0x40004,
    fileType=0x1,
    subtype=0x0,
    date=(0, 0)
  ),
  kids=[
    StringFileInfo(
      [
      StringTable(
        u'040904B0',
        [
        StringStruct(u'CompanyName', u'{COMPANY_NAME}'),
        StringStruct(u'FileDescription', u'{FILE_DESCRIPTION}'),
        StringStruct(u'FileVersion', u'{version}'),
        StringStruct(u'InternalName', u'{APP_NAME}'),
        StringStruct(u'LegalCopyright', u'{COPYRIGHT}'),
        StringStruct(u'OriginalFilename', u'{APP_NAME}.exe'),
        StringStruct(u'ProductName', u'{APP_NAME}'),
        StringStruct(u'ProductVersion', u'{version}'),
        ])
      ]),
    VarFileInfo([VarStruct(u'Translation', [1033, 1200])])
  ]
)
"""


def write_version_info(version: str) -> str:
    """Write the version-info file and return its path."""
    content = _generate_version_info(version)
    with open(VERSION_INFO_FILE, "w", encoding="utf-8") as f:
        f.write(content)
    return VERSION_INFO_FILE


# ================= BUILD =================

def build_app():
    # Check if pyinstaller is installed
    try:
        import PyInstaller
        print("PyInstaller is installed.")
    except ImportError:
        print("PyInstaller not found. Installing...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "pyinstaller"])

    # Resolve version (auto-increment if source changed)
    print("\n--- Version Check ---")
    version = resolve_version()
    print(f"  Building version: {version}")

    # Generate Windows version-info file
    vi_path = write_version_info(version)
    print(f"  Version info written to: {vi_path}\n")

    # Ensure backend is accessible
    if not os.path.exists("clean_apps_backend.py"):
        print("Error: clean_apps_backend.py not found!")
        return

    cmd = [
        sys.executable, "-m", "PyInstaller",
        "--noconfirm",
        "--onefile",
        "--windowed",
        # "--uac-admin",
        "--name", APP_NAME,
        "--icon", ICON_PATH,
        "--add-data", f"logo{os.pathsep}logo",
        "--version-file", vi_path,
        "--hidden-import", "clean_apps_backend",
        SCRIPT_NAME,
    ]

    print(f"Building {APP_NAME} v{version}...")
    subprocess.check_call(cmd)

    exe_path = os.path.join("dist", f"{APP_NAME}.exe")

    # Auto-sign the exe to bypass SmartScreen
    print("\n--- Code Signing ---")
    sign_exe(exe_path)

    print(f"\nBuild completed successfully!")
    print(f"  App:        {APP_NAME} v{version}")
    print(f"  Executable: {exe_path}")


# ================= CODE SIGNING =================

def sign_exe(exe_path: str) -> None:
    """Sign the exe with the CleanSweep self-signed certificate."""
    ps_script = (
        '$cert = Get-ChildItem -Path "Cert:\\CurrentUser\\My" -CodeSigningCert '
        '| Where-Object { $_.Subject -eq "CN=CleanSweep" } '
        '| Select-Object -First 1; '
        'if ($cert) { '
        f'Set-AuthenticodeSignature -FilePath "{exe_path}" -Certificate $cert '
        '-TimestampServer "http://timestamp.digicert.com" -HashAlgorithm SHA256 '
        '| Format-List Status, StatusMessage; '
        '} else { Write-Host "WARNING: CleanSweep signing certificate not found. Exe is unsigned." }'
    )
    try:
        result = subprocess.run(
            ["powershell", "-Command", ps_script],
            capture_output=True, text=True, timeout=30,
        )
        output = (result.stdout + result.stderr).strip()
        if "Valid" in output:
            print("  ✓ Exe signed successfully.")
        elif "not found" in output.lower():
            print("  ⚠ Signing certificate not found. Run the certificate setup first.")
        else:
            print(f"  ⚠ Signing result: {output}")
    except Exception as e:
        print(f"  ⚠ Signing failed (non-critical): {e}")


if __name__ == "__main__":
    try:
        build_app()
    except Exception as e:
        print(f"Build failed: {e}")
