// @type concolic
// @target es5 String.prototype.split
// @feature builtin regexp-split-no-match

function __test_symbolic__(symbolic) {
  if (symbolic.length < 2) {
    symbolic = symbolic.split(/.../);
    // @witness /.../ needs 3 chars; under length<2 there is no match so split yields one element, never more
    __IS_SAT__(symbolic.length > 1, false);
  }
}

__test_symbolic__(__symbolic__("s", ""));
