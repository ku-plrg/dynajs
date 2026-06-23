// @type concolic
// @target es5 String.prototype.split
// @feature builtin regexp-split-length-bound

function __test_symbolic__(symbolic) {
  if (symbolic.length < 5) {
    symbolic = symbolic.split(/a/);
    if (symbolic.length === 2) {
      // @witness x[0] is a prefix of a length-<5 string, so it can never equal the 5-char "hello"
      __IS_SAT__(symbolic[0] === "hello", false);
    }
  }
}

__test_symbolic__(__symbolic__("s", "awh"));
