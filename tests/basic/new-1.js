function f(x) {
  this.p = x;
}
var obj = new f(42);
obj.p;
