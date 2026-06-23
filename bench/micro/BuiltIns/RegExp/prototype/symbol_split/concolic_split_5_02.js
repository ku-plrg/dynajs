// @type concolic
// @target es5 String.prototype.split
// @feature builtin regexp-split-no-match

function __test_symbolic__(symbolic) {
  if (symbolic.length < 2) {
    symbolic = symbolic.split(/.../);

    // @witness no match under length<2 means split always returns exactly one element, so length is always 1
    __IS_SAT__(symbolic.length !== 1, false);
  }
}

__test_symbolic__(__symbolic__("s", ""));
