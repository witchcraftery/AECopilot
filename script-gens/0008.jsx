// Get the active composition
var comp = app.project.activeItem;

// Check if the active item is a composition
if (comp && comp instanceof CompItem) {
    app.beginUndoGroup("Mute/Unmute Audio Tracks");

    // Loop through all layers in the composition
    for (var i = 1; i <= comp.numLayers; i++) {
        var layer = comp.layer(i);

        // Check if the layer is an audio layer
        if (layer.hasAudio) {
            // Check if the Shift key is held down
            if (ScriptUI.environment.keyboardState.shiftKey) {
                // Unmute the audio layer
                layer.audioEnabled = true;
            } else {
                // Mute the audio layer
                layer.audioEnabled = false;
            }
        }
    }

    app.endUndoGroup();
} else {
    alert("Please select a composition.");
}