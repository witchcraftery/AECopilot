// ExtendScript for Adobe After Effects

(function duplicateAndStagger() {
    var comp = app.project.activeItem;
    if (!comp || !(comp instanceof CompItem)) {
        alert("Please select a composition.");
        return;
    }

    var selectedLayers = comp.selectedLayers;
    if (selectedLayers.length !== 1) {
        alert("Please select one layer to duplicate.");
        return;
    }

    var layer = selectedLayers[0];
    var numDuplicates = 10;
    var staggerFrames = 3;
    var frameDuration = comp.frameDuration;

    app.beginUndoGroup("Duplicate and Stagger Layers");

    for (var i = 1; i <= numDuplicates; i++) {
        var duplicatedLayer = layer.duplicate();
        duplicatedLayer.startTime = layer.startTime + i * staggerFrames * frameDuration;
    }

    app.endUndoGroup();
})();