// Swap the names of two selected layers in After Effects

// Check if a project is open
if (app.project) {
    // Check if a composition is active
    if (app.project.activeItem && app.project.activeItem instanceof CompItem) {
        var comp = app.project.activeItem;
        var selectedLayers = comp.selectedLayers;

        // Check if exactly two layers are selected
        if (selectedLayers.length === 2) {
            app.beginUndoGroup("Swap Layer Names");

            // Get the names of the selected layers
            var firstLayerName = selectedLayers[0].name;
            var secondLayerName = selectedLayers[1].name;

            // Swap the names
            selectedLayers[0].name = secondLayerName;
            selectedLayers[1].name = firstLayerName;

            app.endUndoGroup();
        } else {
            alert("Please select exactly two layers to swap their names.");
        }
    } else {
        alert("Please select a composition.");
    }
} else {
    alert("Please open a project.");
}