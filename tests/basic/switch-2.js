function f() {
  switch (2) {
    default: return 3;
  }
}
switch (1) {
  case f(): "a"; break;
  default: "b";
}
