// @type concolic
// @target es6+ Set.prototype.forEach
// @feature builtin forEach

function __test_symbolic__(symbolic) {
  var s = new Set([symbolic]);
  if (s.size === 1) {
    var seen = -1;
    s.forEach(function (v) { seen = v; });
    // @witness the only element is symbolic, so forEach hands back exactly symbolic
    __IS_SAT__(seen !== symbolic, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', 7));
