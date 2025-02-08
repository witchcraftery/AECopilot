(function() {
    var comp = app.project.activeItem;
    if (!comp || !(comp instanceof CompItem)) {
        alert("Please select a composition.");
        return;
    }

    var selectedProperties = comp.selectedProperties;
    if (selectedProperties.length === 0) {
        alert("Please select at least one property.");
        return;
    }

    app.beginUndoGroup("Place Keyframe at CTI");

    for (var i = 0; i < selectedProperties.length; i++) {
        var property = selectedProperties[i];
        if (property.canVaryOverTime) {
            property.setValueAtTime(comp.time, property.value);
        } else {
            console.log("Property cannot vary over time: " + property.name);
        }
    }

    app.endUndoGroup();
})();