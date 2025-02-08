// This script spaces layers in the Y position equally by 70 pixels starting from the first selected layer's original Y position.

(function spaceLayersVertically() {
    var comp = app.project.activeItem;
    if (!comp || !(comp instanceof CompItem)) {
        alert("Please select a composition.");
        return;
    }

    var selectedLayers = comp.selectedLayers;
    if (selectedLayers.length < 2) {
        alert("Please select at least two layers.");
        return;
    }

    app.beginUndoGroup("Space Layers Vertically");

    // Get the starting Y position from the first selected layer
    var startY = selectedLayers[0].position.value[1];

    for (var i = 0; i < selectedLayers.length; i++) {
        var layer = selectedLayers[i];
        var newPosition = [layer.position.value[0], startY + (i * 80), layer.position.value[2]];
        layer.position.setValue(newPosition);
    }

    app.endUndoGroup();
})();