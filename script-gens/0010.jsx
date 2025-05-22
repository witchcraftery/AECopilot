// This script staggers the selected layers by one frame in the active composition.

(function() {
    var comp = app.project.activeItem; // Get the active composition

    if (comp && comp instanceof CompItem) {
        var selectedLayers = comp.selectedLayers; // Get the selected layers

        if (selectedLayers.length > 0) {
            app.beginUndoGroup("Stagger Layers by One Frame");

            var frameDuration = comp.frameDuration; // Get the duration of one frame

            for (var i = 0; i < selectedLayers.length; i++) {
                var layer = selectedLayers[i];
                layer.startTime += i * frameDuration; // Stagger each layer by one frame
            }

            app.endUndoGroup();
        } else {
            alert("Please select at least one layer.");
        }
    } else {
        alert("Please select a composition.");
    }
})();