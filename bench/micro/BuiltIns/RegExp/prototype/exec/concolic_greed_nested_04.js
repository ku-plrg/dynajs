// @type concolic
// @target es5 RegExp.prototype.exec
// @feature builtin regexp-exec-greed-nested

function __test_symbolic__(symbolic) {
  var b = /^((.)(.))?$/.exec(symbolic);
  if (b) {
    if (b[0] === "") {
    } else {
      // @witness __test_symbolic__("aa")
      __IS_SAT__(b[3] === b[2], true);
    }
  }
}

__test_symbolic__(__symbolic__("s", "aa"));
