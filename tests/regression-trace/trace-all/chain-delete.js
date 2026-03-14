var obj = { foo: 1 };

delete obj?.foo;

assert(obj.foo === undefined)