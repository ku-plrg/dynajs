var first = 0;
var second = 0;
function* g() {
  first += 1;
  yield;
  second += 1;
};

var callCount = 0;
var f;
f = ([,,,]) => {
  assert(first === 1);
  assert(second === 1);
  callCount = callCount + 1;
};

f(g());
assert(callCount === 1, 'arrow function invoked exactly once');
