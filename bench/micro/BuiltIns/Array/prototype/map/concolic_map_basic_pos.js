// @type concolic
// @target es5 Array.prototype.map
// @feature builtin map

function __test_symbolic__(symbolic) {
  if (symbolic.length === 2) {
    var r = symbolic.map(function (v) { return v * 2; });
    // @witness map applies v*2 elementwise, so result index 0 is twice source index 0
    __IS_SAT__(r[0] !== symbolic[0] * 2, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', [1, 2]));
