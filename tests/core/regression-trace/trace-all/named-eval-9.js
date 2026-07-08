// computed property key — named eval must NOT apply (name stays null)
var k = "foo";
var obj = {
    [k]: function () {},
};
obj[k]();
