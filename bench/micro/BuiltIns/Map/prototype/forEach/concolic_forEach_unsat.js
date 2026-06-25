// @type concolic
// @target es6+ Map.prototype.forEach
// @feature builtin forEach

function __test_symbolic__(symbolic) {
  var m = new Map();
  m.set("k", symbolic);
  if (m.size === 1) {
    var seen = -1;
    m.forEach(function (v) { seen = v; });
    // @witness the only entry's value is symbolic, so forEach hands back exactly symbolic
    __IS_SAT__(seen !== symbolic, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', 7));
