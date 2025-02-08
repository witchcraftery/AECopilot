// Get the active composition
var comp = app.project.activeItem;

// Check if the active item is a composition
if (comp instanceof CompItem) {
    app.beginUndoGroup("Mute/Unmute Audio Tracks");

    // Check if the Shift key is pressed
    var isShiftPressed = ScriptUI.environment.keyboardState.shiftKey;

    // Loop through all layers in the composition
    for (var i = 1; i <= comp.numLayers; i++) {
        var layer = comp.layer(i);

        // Check if the layer is an audio layer
        if (layer.hasAudio) {
            // Mute or unmute based on the Shift key state
            layer.audioEnabled = isShiftPressed;
        }
    }

    app.endUndoGroup();
} else {
    alert("Please select a composition.");
}