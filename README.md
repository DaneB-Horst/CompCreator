# CompCreator — Create After Effects Comps From CSV

An Adobe After Effects script that automatically creates multiple compositions from a CSV file and adds the matching Disclaimer Illustrator artwork to each composition.

Instead of manually creating dozens of compositions with different dimensions, durations, and frame rates, you can define everything in an Excel spreadsheet and let the script build the comps for you.

---

## Features

* Create multiple After Effects compositions from a CSV
* Define comp width and height from the spreadsheet
* Define duration and FPS
* Automatically generate comp names
* Automatically find the correct Disclaimer Illustrator file
* Import Illustrator files as **Footage**
* Prevent Illustrator files from creating additional compositions
* Automatically create a `Disclaimer` folder in After Effects if one doesn't already exist
* Detect an existing `Disclaimer` folder anywhere in the project, including subfolders
* Import each Illustrator file only once when the same dimensions are used multiple times
* Automatically center the Disclaimer artwork inside each composition
* Report missing Illustrator files after processing
* Dockable After Effects panel

The script processes every valid row in the CSV and creates a composition using the supplied dimensions, duration, and FPS.

---

# How It Works

The workflow is:

```text
Excel
   ↓
Save as CSV UTF-8
   ↓
CompCreator
   ↓
Creates After Effects Comps
   ↓
Finds matching Illustrator files
   ↓
Imports Disclaimer artwork
   ↓
Centers artwork in each Comp
```

For example, if your spreadsheet contains:

```text
192 x 288
```

the script looks for:

```text
Disclaimer - 192x288.ai
```

and places that Illustrator artwork into the generated composition.

---

# Excel Example

The included [ExcelExample.xlsx](https://github.com/user-attachments/files/31251737/ExcelExample.xlsx) demonstrates the expected spreadsheet structure.

The first row contains the column headings:

| Comp Name                     | Width | Height | Duration | FPS |
| ----------------------------- | ----: | -----: | -------: | --: |
| AHWBM2086_SIGN UP DOOH BOARDS |  1920 |   1080 |       15 |  25 |
|                               |   512 |    384 |       15 |  25 |
|                               |   192 |    288 |       15 |  25 |
|                               |   384 |    192 |       15 |  25 |
|                               |   512 |    288 |       15 |  25 |
|                               |   768 |    384 |       15 |  25 |
|                               |   576 |    336 |       15 |  25 |
|                               |   576 |    288 |       15 |  25 |
|                               |   462 |    264 |       15 |  25 |
|                               |   720 |    480 |       10 |  25 |
|                               |   576 |    288 |       10 |  25 |

The script uses the **first data row** to obtain the base job name. Subsequent rows can leave the Comp Name field blank.

---

# Spreadsheet Columns

## Comp Name

The first data row is used as the base name for the generated compositions.

For example:

```text
AHWBM2086_SIGN UP DOOH BOARDS
```

The script then adds the dimensions and duration to create the final comp name.

Example:

```text
AHWBM2086_SIGN UP DOOH BOARDS-1920x1080-15s
```

---

## Width

The width of the After Effects composition in pixels.

Example:

```text
1920
```

---

## Height

The height of the After Effects composition in pixels.

Example:

```text
1080
```

---

## Duration

The composition duration in seconds.

Example:

```text
15
```

creates a 15-second composition.

---

## FPS

The frame rate of the composition.

Example:

```text
25
```

creates a composition running at 25 FPS.

The script validates the Width, Height, Duration, and FPS values before creating a composition.

---

# Important: Save Excel as CSV

After completing the Excel spreadsheet, save it as:

```text
CSV UTF-8 (Comma delimited) (*.csv)
```

The script displays a warning about this when it is first run.

Using another CSV format may cause special characters to import incorrectly.

You can select:

**Don't show this message again**

if you don't want to see the warning every time.

---

# Disclaimer Illustrator Files

The script expects the Illustrator files to follow this naming convention:

```text
Disclaimer - WIDTHxHEIGHT.ai
```

For example:

```text
Disclaimer - 1920x1080.ai
Disclaimer - 512x384.ai
Disclaimer - 192x288.ai
Disclaimer - 384x192.ai
Disclaimer - 512x288.ai
```

The dimensions in the filename must match the Width and Height values in the CSV.

For a CSV row containing:

```text
192 | 288
```

the script searches for:

```text
Disclaimer - 192x288.ai
```

---

# Disclaimer Folder Location

When the script runs, it asks for the location of the folder containing the Illustrator files.

Instead of navigating through a file picker, simply paste the server/folder path into the dialog.

Example:

```text
\\Server\Projects\Disclaimers
```

or:

```text
D:\Projects\Disclaimers
```

The script checks that the specified folder exists before continuing.

---

# After Effects Disclaimer Folder

The imported Illustrator files are placed inside an After Effects project folder named:

```text
Disclaimer
```

If a `Disclaimer` folder already exists anywhere in the After Effects project, the script uses the existing folder.

If no `Disclaimer` folder exists, the script creates one at the project root.

---

# Illustrator Import

The Illustrator files are imported as:

```text
Footage
```

rather than as an Illustrator composition.

This means After Effects does **not** create an additional composition for each Illustrator file.

The artwork is imported as a single merged/flattened footage item.

The imported footage is also placed into the After Effects `Disclaimer` folder automatically.

---

# Duplicate Illustrator Files

If multiple rows use the same dimensions, the script will not repeatedly import the same Illustrator file.

For example, if your CSV contains:

```text
576 x 288
576 x 288
576 x 288
```

the script imports:

```text
Disclaimer - 576x288.ai
```

only once and reuses the imported footage in each composition.

---

# Artwork Positioning

The Disclaimer artwork is automatically centered in the generated composition.

The script sets the layer position to the center of the composition:

```text
X = Width / 2
Y = Height / 2
```

It also sets the Illustrator footage's anchor point to its native center.

This allows Illustrator artwork matching the composition dimensions to sit correctly without manually repositioning it.

---

# Missing Illustrator Files

If the script cannot find a matching Illustrator file, it does **not** stop the entire process.

Instead, it:

1. Continues creating the remaining compositions.
2. Records the missing Illustrator file.
3. Displays a list of missing files when processing is complete.

For example:

```text
24 comp(s) created successfully.

The following Illustrator file(s) were not found:

Disclaimer - 576x288.ai
Disclaimer - 462x264.ai
```

---

# Installation

1. Download `CompCreator-V3.1.jsx`.
2. Place it in your After Effects Scripts folder.

### Windows

```text
C:\Program Files\Adobe\Adobe After Effects\Support Files\Scripts\
```

### Mac

```text
/Applications/Adobe After Effects/Scripts/
```

3. Restart After Effects.
4. Run the script from:

```text
File → Scripts → Run Script File...
```

Alternatively, place the script in the `ScriptUI Panels` folder if you want to use it as a dockable panel.

The script creates a panel named:

```text
Create Comps From CSV
```

with a button to start the process.

---

# Basic Usage

### 1. Prepare your Excel file

Use the included:

```text
ExcelExample.xlsx
```

as a template.

Enter:

* Comp Name
* Width
* Height
* Duration
* FPS

---

### 2. Save as CSV

In Excel, save the spreadsheet as:

```text
CSV UTF-8 (Comma delimited) (*.csv)
```

---

### 3. Run CompCreator

Open After Effects and launch the script.

Click:

```text
Create Comps From CSV
```

---

### 4. Select the CSV

Choose the CSV file you exported from Excel.

---

### 5. Enter the Disclaimer folder path

Paste the folder path containing your Illustrator files.

---

### 6. Let the script build the project

The script will:

* Read each row
* Create the required composition
* Find the matching Illustrator file
* Import it as Footage
* Add it to the composition
* Center the artwork
* Continue through the entire CSV

---

# Example

Given this CSV row:

```text
AHWBM2086_SIGN UP DOOH BOARDS,192,288,15,25
```

and this Illustrator file:

```text
Disclaimer - 192x288.ai
```

the script creates:

```text
AHWBM2086_SIGN UP DOOH BOARDS-192x288-15s
```

with:

```text
Width:     192
Height:    288
Duration:  15 seconds
FPS:       25
```

and places:

```text
Disclaimer - 192x288.ai
```

inside the composition.

---

# Troubleshooting

### "CSV contains no data."

Make sure the CSV contains a header row and at least one data row.

### "Unable to open CSV."

Check that the CSV file is accessible and not locked by another application.

### "No folder path was entered."

Enter the path to the folder containing the Disclaimer Illustrator files.

### "The specified folder could not be found."

Check that the server or local folder path is correct and accessible.

### Illustrator file is missing

Check that the Illustrator filename exactly follows:

```text
Disclaimer - WIDTHxHEIGHT.ai
```

For example:

```text
Disclaimer - 192x288.ai
```

---

# Requirements

* Adobe After Effects
* Adobe Excel or another spreadsheet application capable of exporting CSV
* CSV UTF-8 format
* Matching Disclaimer Illustrator files

---

# Included Example

This repository includes:

```text
CompCreator-V3.1.jsx
ExcelExample.xlsx
```

Use `ExcelExample.xlsx` as a starting point when preparing your own CSV data.

---

## License

MIT License

---

## Author

**Dane**

Built to automate repetitive After Effects composition creation and Disclaimer artwork placement.


