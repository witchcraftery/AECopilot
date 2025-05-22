// Ensure a composition and layer are selected
var comp = app.project.activeItem;
if (!(comp && comp instanceof CompItem)) {
    alert("Please select a composition and a layer.");
} else {
    var layer = comp.selectedLayers[0]; // Get the first selected layer
    if (!layer) {
        alert("Please select a layer.");
    } else {
        app.beginUndoGroup("Change Layer Properties");

        // Turn off the layer's visibility
        layer.enabled = false;

        // Set the layer's label color to none (0)
        layer.label = 0;

        app.endUndoGroup();
    }
}