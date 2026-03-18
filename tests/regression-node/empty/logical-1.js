var x;

x = undefined;
x = (null ?? 41) && 42;
assert(x === 42);

x = undefined;
x = null ?? (41 && 42);
assert(x === 42);

x = undefined;
x = (41 && 42) ?? null;
assert(x === 42);

x = undefined;
x = 41 && (null ?? 42);
assert(x === 42);