// object property (identifier key) with FunctionExpression — should infer name
// ArrowFunctionExpression in property position cannot reference the name as a variable,
// so it is intentionally left as null
var obj = {
    foo: function () {},
    bar: () => {},
};
obj.foo();
obj.bar();
