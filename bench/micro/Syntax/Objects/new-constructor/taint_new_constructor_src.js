// @type taint
// @target es5 new-constructor
// @feature syntax new-constructor
// @done

function TNC_Box(v) {
  this.v = v;
}

function __test_taint__(tainted) {
    var tnc_b = new TNC_Box(tainted);
    // @witness __test_taint__('x') => tnc_b.v = 'x' tainted
    __assert_taint__(tnc_b.v, true);
}

__test_taint__(__set_taint__("tv"));
