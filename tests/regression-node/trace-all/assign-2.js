var __i = 0;
var count = 0;

var obj = {
  get i() {
    count++;
    return __i;
  },
  set i(v) {
    count++;
    __i = v;
  }
};


obj.i += 1;
print(obj.i);
print(count);