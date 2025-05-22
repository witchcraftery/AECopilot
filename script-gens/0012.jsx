// This script staggers the selected layers by one frame in After Effects

// Ensure a project is open
if (app.project) {
    app.beginUndoGroup("Stagger Layers");

    var comp = app.project.activeItem;
    if (comp && comp instanceof CompItem) {
        var selectedLayers = comp.selectedLayers;

        if (selectedLayers.length > 0) {
            for (var i = 0; i < selectedLayers.length; i++) {
                selectedLayers[i].startTime += i * comp.frameDuration;
            }
        } else {
            alert("Please select at least one layer.");
        }
    } else {
        alert("Please select a composition.");
    }

    app.endUndoGroup();
} else {
    alert("Please open a project first.");
}