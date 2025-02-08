// Check if two compositions are selected in the project panel
if (app.project.selection.length === 2) {
    var comp1 = app.project.selection[0];
    var comp2 = app.project.selection[1];

    // Ensure both selections are compositions
    if (comp1 instanceof CompItem && comp2 instanceof CompItem) {
        app.beginUndoGroup("Swap Composition Names");

        // Swap the names of the two compositions
        var tempName = comp1.name;
        comp1.name = comp2.name;
        comp2.name = tempName;

        app.endUndoGroup();
    } else {
        alert("Please select exactly two compositions.");
    }
} else {
    alert("Please select exactly two compositions.");
}