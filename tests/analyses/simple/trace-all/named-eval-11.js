// reserved-word string literal key — named eval must NOT apply (name stays null)
var obj = {
    "return": function () {},
};
obj["return"]();
