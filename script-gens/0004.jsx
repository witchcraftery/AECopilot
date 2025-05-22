(function swapSelectedLayersPositions() {
    var comp = app.project.activeItem;
    if (!comp || !(comp instanceof CompItem)) {
        // alert("Please select a composition.");
        return;
    }
    var selectedLayers = comp.selectedLayers;
    if (selectedLayers.length !== 2) {
        // alert("Please select exactly two layers.");
        return;
    }

    app.beginUndoGroup("Swap Layers Positions");

    // Store positions
    var pos1 = selectedLayers[0].property("Position").value;
    var pos2 = selectedLayers[1].property("Position").value;

    // Swap positions
    selectedLayers[0].property("Position").setValue(pos2);
    selectedLayers[1].property("Position").setValue(pos1);

    app.endUndoGroup();
})();