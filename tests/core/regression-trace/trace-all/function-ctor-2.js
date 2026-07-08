// Function constructor called as a function (no `new`): should be instrumented too
var g = Function('x', 'return x * 2;');
g(21);
