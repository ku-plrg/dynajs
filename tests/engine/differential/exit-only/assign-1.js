var __i = 0;
var count = 0;

Object.defineProperty(globalThis, 'i', {
  get() {
    count++;
    return __i;
  },
  set(v) {
    count++;
    __i = v;
  }
});


i += 1;
print(i);
print(count);