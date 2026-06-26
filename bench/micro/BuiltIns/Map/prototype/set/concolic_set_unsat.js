// @type concolic
// @target es6+ Map.prototype.set
// @feature builtin set
// @done

function __test_symbolic__(symbolic) {
  var m = new Map();
  if (m.set("k", symbolic).size === 1) {
    // @witness set stores symbolic under "k" (raising size to 1), so get("k") returns symbolic
    __IS_SAT__(m.get("k") !== symbolic, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', 8));
