
var x;

x = undefined;
x = (null ?? 42) || 43;
assert(x === 42);

x = undefined;
x = null ?? (42 || 43);
assert(x === 42);

x = undefined;
x = (null || 42) ?? 43;
assert(x === 42);

x = undefined;
x = null || (42 ?? 43);
assert(x === 42);

x = undefined;
x = (42 || 43) ?? null;
assert(x === 42);

x = undefined;
x = 42 || (null ?? 43);
assert(x === 42);
