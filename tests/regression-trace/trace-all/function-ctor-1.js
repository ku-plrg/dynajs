// Function constructor: instrumentCodePre/instrumentCode should fire
var f = new Function('a', 'b', 'return a + b;');
f(2, 3);
