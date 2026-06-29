// @type taint
// @target es5 Object
// @feature syntax object-taint
// @done

function __test_taint__(tainted) {
    // copying the tainted field into a clean object taints only that field
    var tnc_r = {a: 0, b: 0};
    tnc_r.a = tainted.a;
    // @witness mixed (tainted + clean) => not all-tainted, clean
    __assert_taint__(tnc_r, false);
}

__test_taint__(__set_taint__({a: 1}));
