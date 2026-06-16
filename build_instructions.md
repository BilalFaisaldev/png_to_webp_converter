# Standalone Windows Executable Build Guide

This guide details how to build the "PNG to WebP Converter" into a standalone, single-file `.exe` executable for Windows 10 and Windows 11.

## Prerequisites

1. Ensure the Python environment has the dependencies installed:
   ```bash
   pip install -r requirements.txt
   ```
2. Verify that the asset icons have been generated:
   - There should be a file at `assets/logo.ico` and `assets/logo.png`. If not, run:
     ```bash
     python icons_generator.py
     ```

## Build Commands

You can build the application using two configurations.

### Option 1: Standalone Single File (Recommended)
This command builds a single `.exe` file that contains all libraries, the Python runtime, and embeds the application icon.

Open your terminal in the project directory and run:

```powershell
pyinstaller --onefile --windowed --icon=assets/logo.ico --name="PNG_to_WebP_Converter" main.py
```

### Option 2: Folder Directory (Faster Startup)
If you have a very large number of conversions and want slightly faster launch times, you can build a folder directory distribution:

```powershell
pyinstaller --onedir --windowed --icon=assets/logo.ico --name="PNG_to_WebP_Converter" main.py
```

## Argument Explanations

- `--onefile` / `-F`: Bundles everything into a single executable file.
- `--windowed` / `--noconsole` / `-w`: Disables the command prompt console window from appearing in the background when running the application.
- `--icon=assets/logo.ico`: Sets the executable file icon in Windows Explorer and the taskbar.
- `--name="PNG_to_WebP_Converter"`: Sets the output name of the executable.

## Bundling Assets (Advanced)

If you want the application's internal window icon to be displayed even if the `assets` folder is not present on the user's computer, you can bundle the `assets/` folder inside the executable using the `--add-data` flag:

**On Windows (PowerShell/CMD):**
```powershell
pyinstaller --onefile --windowed --icon=assets/logo.ico --add-data "assets;assets" --name="PNG_to_WebP_Converter" main.py
```

*Note: The `main.py` code already uses a fallback mechanism if assets are missing, meaning the app will launch safely under any circumstance.*

## Output Location

Once the compilation completes, the following directories will be created:
1. `build/`: Temporary files used by PyInstaller during compilation (can be safely deleted).
2. `dist/`: Contains the final standalone executable `PNG_to_WebP_Converter.exe`.
3. `PNG_to_WebP_Converter.spec`: The configuration spec file (can be reused for subsequent builds).
