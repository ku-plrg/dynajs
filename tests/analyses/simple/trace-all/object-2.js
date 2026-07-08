var x = 2;
var obj = { get p() { return x; }, set p(y) { x = x + y; } };
obj.p = 3;
obj['p'];
