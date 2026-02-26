var obj = { foo: { bar: function(...args) { return args; } } };
obj?.foo?.bar?.(1,2,3);