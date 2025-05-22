(function evenlySpaceLayers() {
    var comp = app.project.activeItem;
    if (!comp || !(comp instanceof CompItem)) {
        alert('Please select a composition.');
        return;
    }

    app.beginUndoGroup('Evenly Space Layers');

    var layers = comp.selectedLayers;
    if (layers.length < 2) {
        alert('Please select at least two layers.');
        app.endUndoGroup();
        return;
    }

    // Check if the shift key is pressed
    var shiftPressed = ScriptUI.environment.keyboardState.shiftKey;

    // Sort layers by their X or Y position based on shift key
    layers.sort(function(a, b) {
        if (shiftPressed) {
            // Sort by Y position if shift is pressed
            return a.transform.position.value[1] - b.transform.position.value[1];
        } else {
            // Sort by X position if shift is not pressed
            return a.transform.position.value[0] - b.transform.position.value[0];
        }
    });

    // Calculate total distance and spacing
    var totalDistance, spacing;
    if (shiftPressed) {
        // Use Y position for total distance if shift is pressed
        totalDistance = layers[layers.length - 1].transform.position.value[1] - layers[0].transform.position.value[1];
    } else {
        // Use X position for total distance if shift is not pressed
        totalDistance = layers[layers.length - 1].transform.position.value[0] - layers[0].transform.position.value[0];
    }
    spacing = totalDistance / (layers.length - 1);

    for (var i = 1; i < layers.length; i++) {
        if (shiftPressed) {
            // Space layers vertically if shift is pressed
            var newY = layers[0].transform.position.value[1] + spacing * i;
            var currentPos = layers[i].transform.position.value;
            layers[i].transform.position.setValue([currentPos[0], newY, currentPos[2]]);
        } else {
            // Space layers horizontally if shift is not pressed
            var newX = layers[0].transform.position.value[0] + spacing * i;
            var currentPos = layers[i].transform.position.value;
            layers[i].transform.position.setValue([newX, currentPos[1], currentPos[2]]);
        }
    }

    app.endUndoGroup();
})();
