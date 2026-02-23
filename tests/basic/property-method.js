let o1 = { f() { return 42; } };
o1.f();

let o2 = { async f() { return 42; } };
o2.f();

let o3 = { *f() { yield 42; yield 43; } };
o3.f().next(1);
o3.f().next(2);
