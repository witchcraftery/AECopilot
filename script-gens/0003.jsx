// This script will take a selected shape layer and break its groups into their own individual shape layers.

(function() {
    var comp = app.project.activeItem;
    if (!comp || !(comp instanceof CompItem)) {
        alert('Please select a composition.');
        return;
    }

    var selectedLayers = comp.selectedLayers;
    if (selectedLayers.length !== 1 || !(selectedLayers[0] instanceof ShapeLayer)) {
        alert('Please select a single shape layer.');
        return;
    }

    app.beginUndoGroup("Break Shape Groups Into Individual Layers");

    var originalLayer = selectedLayers[0];
    var groups = originalLayer.property("Contents");
    var numGroups = groups.numProperties;

    for (var i = 1; i <= numGroups; i++) {
        // Duplicate the original layer for each group
        var newLayer = originalLayer.duplicate();
        newLayer.name = originalLayer.name + " - " + groups(i).name;
        // Remove all groups except the i-th one
        for (var j = newLayer.property("Contents").numProperties; j > 0; j--) {
            if (j !== i) {
                newLayer.property("Contents").property(j).remove();
            }
        }
    }

    // Optionally, remove the original layer
    // originalLayer.remove();

    app.endUndoGroup();
})();