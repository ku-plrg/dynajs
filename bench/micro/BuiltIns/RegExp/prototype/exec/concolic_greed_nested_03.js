// @type concolic
// @target es5 RegExp.prototype.exec
// @feature builtin regexp-exec-greed-nested

function __test_symbolic__(symbolic) {
  var b = /^((.)(.))?$/.exec(symbolic);
  if (b) {
    if (b[0] === "") {
      // @witness an empty match means the optional group never participated, so b[3] is always undefined and can never be truthy
      __IS_SAT__(b[3], false);
    } else {
    }
  }
}

__test_symbolic__(__symbolic__("s", ""));
