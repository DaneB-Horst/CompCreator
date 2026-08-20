// ==========================================
// Create Comps From CSV
// Made by Dane
// ==========================================

(function buildUI(thisObj) {

function getOrCreateProjectFolder(folderName) {

    // Search the entire After Effects project, including
    // subfolders, for an existing folder with this name.
    for (var i = 1; i <= app.project.numItems; i++) {
        var item = app.project.item(i);

        if (item instanceof FolderItem &&
            item.name == folderName) {
            return item;
        }
    }

    // If no Disclaimer folder exists anywhere in the project,
    // create one at the project root.
    return app.project.items.addFolder(folderName);
}

function createCompsFromCSV() {

    app.beginUndoGroup("Create Comps From CSV");

    //==================================================
    // CSV UTF-8 Reminder
    //==================================================

    var section = "CompCreator";
    var key = "HideCSVWarning";

    var hideWarning = false;

    if (app.settings.haveSetting(section, key)) {
        hideWarning = (app.settings.getSetting(section, key) == "true");
    }

    if (!hideWarning) {

        var dlg = new Window("dialog", "Create Comps From CSV");
        dlg.orientation = "column";
        dlg.alignChildren = ["fill","top"];
        dlg.spacing = 10;
        dlg.margins = 20;

        dlg.add("statictext", undefined, "Before importing:");

        var panel = dlg.add("panel", undefined, "Important");
        panel.orientation = "column";
        panel.alignChildren = "left";
        panel.margins = 15;

        panel.add("statictext", undefined, "Save your Excel file as:");
        panel.add("statictext", undefined, "CSV UTF-8 (Comma delimited) (*.csv)");

        dlg.add("statictext", undefined,
            "Using another CSV format may cause");
        dlg.add("statictext", undefined,
            "special characters to import incorrectly.");

        var dontShow = dlg.add("checkbox", undefined, "Don't show this message again");

        var btnGroup = dlg.add("group");
        btnGroup.alignment = "right";

        btnGroup.add("button", undefined, "Cancel");

        var okBtn = btnGroup.add("button", undefined, "Continue", {name:"ok"});
        okBtn.active = true;

        if (dlg.show() != 1) {
            app.endUndoGroup();
            return;
        }

        if (dontShow.value) {
            app.settings.saveSetting(section, key, "true");
        }
    }

    //==================================================
    // Select CSV
    //==================================================

    var csvFile = File.openDialog("Select CSV File", "*.csv");

    if (!csvFile) {
        app.endUndoGroup();
        return;
    }

    if (!csvFile.open("r")) {
        alert("Unable to open CSV.");
        app.endUndoGroup();
        return;
    }

    var data = csvFile.read();
    csvFile.close();

    var lines = data.split(/\r\n|\n|\r/);

    if (lines.length <= 1) {
        alert("CSV contains no data.");
        app.endUndoGroup();
        return;
    }

    // Detect delimiter
    var delimiter = ",";
    if (lines[0].indexOf(";") !== -1)
        delimiter = ";";

    //-------------------------------------------
    // Get the job name from the first data row
    //-------------------------------------------

    var firstCols = lines[1].split(delimiter);
    var baseName = firstCols[0].replace(/^\s+|\s+$/g, "");
    var compCount = 0;

    //----------------------------------------------------
    // Get Disclaimer Illustrator Folder
    //----------------------------------------------------
    // Enter the server path directly instead of navigating
    // through the folder picker.
    //----------------------------------------------------

    var pathDialog = new Window("dialog", "Disclaimer Illustrator Folder");
    pathDialog.orientation = "column";
    pathDialog.alignChildren = ["fill", "top"];
    pathDialog.spacing = 10;
    pathDialog.margins = 15;

    pathDialog.add("statictext", undefined,
        "Paste the server folder path containing the Disclaimer Illustrator files:"
    );

    var pathInput = pathDialog.add("edittext", undefined, "");
    pathInput.characters = 70;
    pathInput.active = true;

    var pathButtons = pathDialog.add("group");
    pathButtons.alignment = "right";

    pathButtons.add("button", undefined, "Cancel");
    var pathOK = pathButtons.add("button", undefined, "Continue", {name:"ok"});

    if (pathDialog.show() != 1) {
        app.endUndoGroup();
        return;
    }

    var disclaimerPath = pathInput.text.replace(/^\s+|\s+$/g, "");

    if (disclaimerPath == "") {
        alert("No folder path was entered.");
        app.endUndoGroup();
        return;
    }

    var disclaimerFolder = new Folder(disclaimerPath);

    if (!disclaimerFolder.exists) {
        alert(
            "The specified folder could not be found:\n\n" +
            disclaimerPath
        );
        app.endUndoGroup();
        return;
    }

    //----------------------------------------------------
    // Get / create the Disclaimer folder in After Effects
    //----------------------------------------------------

    var disclaimerProjectFolder = getOrCreateProjectFolder("Disclaimer");

    //----------------------------------------------------
    // Keep imported Illustrator footage in memory so the
    // same AI file is not imported more than once.
    //----------------------------------------------------

    var importedDisclaimerItems = {};
    var missingDisclaimerFiles = {};

    for (var i = 1; i < lines.length; i++) {

        if (lines[i].replace(/\s/g, "") === "")
            continue;

        var cols = lines[i].split(delimiter);

        if (cols.length < 5)
            continue;

        var width = parseInt(cols[1], 10);
        var height = parseInt(cols[2], 10);
        var duration = parseFloat(cols[3]);
        var fps = parseFloat(cols[4]);

        if (isNaN(width) || isNaN(height) || isNaN(duration) || isNaN(fps))
            continue;

        // Build the comp name
        var compName = baseName + "-" + width + "x" + height + "-" + duration + "s";

        var comp = app.project.items.addComp(
            compName,
            width,
            height,
            1,
            duration,
            fps
        );

        //----------------------------------------------------
        // Import matching Disclaimer Illustrator file
        //----------------------------------------------------
        // Example:
        // Comp = 192x288
        // File = Disclaimer - 192x288.ai
        //----------------------------------------------------

        var illustratorFile = new File(
            disclaimerFolder.fsName +
            "/Disclaimer - " + width + "x" + height + ".ai"
        );

        if (illustratorFile.exists) {

            //------------------------------------------------
            // Import Illustrator as FOOTAGE.
            //
            // This prevents After Effects from creating a
            // separate composition for the Illustrator file.
            // The Illustrator artwork is imported as one
            // merged/flattened footage item.
            //------------------------------------------------

            var cacheKey = illustratorFile.fsName.toLowerCase();
            var importedItem = importedDisclaimerItems[cacheKey];

            if (!importedItem) {

                var importOptions = new ImportOptions(illustratorFile);

                if (importOptions.canImportAs(ImportAsType.FOOTAGE)) {
                    importOptions.importAs = ImportAsType.FOOTAGE;
                }

                importedItem = app.project.importFile(importOptions);

                // Put the imported Illustrator footage in the
                // After Effects "Disclaimer" folder.
                importedItem.parentFolder = disclaimerProjectFolder;

                // Prevent the imported Illustrator footage from
                // remaining selected as the active Project item.
                importedItem.selected = false;

                // Remember it so repeated CSV rows using the
                // same dimensions do not import another copy.
                importedDisclaimerItems[cacheKey] = importedItem;
            }

            //------------------------------------------------
            // Add the imported Illustrator artwork to comp
            //------------------------------------------------

            var disclaimerLayer = comp.layers.add(importedItem);

            // Keep the imported footage deselected.
            // The active comp/viewer is restored after the
            // entire CSV has finished processing.

            importedItem.selected = false;

            // Center it in the comp.
            disclaimerLayer.property("Position").setValue([
                width / 2,
                height / 2
            ]);

            //------------------------------------------------
            // Keep the Illustrator artwork centered at its
            // native dimensions.
            //------------------------------------------------

            disclaimerLayer.property("Anchor Point").setValue([
                importedItem.width / 2,
                importedItem.height / 2
            ]);

        } else {

            // Record missing files and continue processing the
            // remaining CSV rows.
            missingDisclaimerFiles[illustratorFile.fsName] = true;
        }

        compCount++;
    }

    // Leave AE focused on the last generated comp.
    if (compCount > 0 && comp) {
        comp.selected = true;
        app.project.activeItem = comp;
    }

    app.endUndoGroup();

    var missingList = "";
    for (var missingPath in missingDisclaimerFiles) {
        missingList += "\n" + missingPath;
    }

    if (missingList != "") {
        alert(
            compCount + " comp(s) created successfully.\n\n" +
            "The following Illustrator file(s) were not found:" +
            missingList
        );
    } else {
        alert(
            compCount +
            " comp(s) created successfully.\n\n" +
            "Illustrator files were imported as Footage into the Disclaimer folder."
        );
    }
}

    var win = (thisObj instanceof Panel)
        ? thisObj
        : new Window("palette", "Create Comps From CSV", undefined, {resizeable:true});

    win.orientation = "column";
    win.alignChildren = ["fill","top"];
    win.spacing = 10;
    win.margins = 10;

    var createBtn = win.add("button", undefined, "Create Comps From CSV");

    createBtn.onClick = createCompsFromCSV;

    //----------------------------------------------------

    win.layout.layout(true);
    win.layout.resize();
    win.onResizing = win.onResize = function () {
        this.layout.resize();
    };

    if (win instanceof Window) {
        win.center();
        win.show();
    }

})(this);