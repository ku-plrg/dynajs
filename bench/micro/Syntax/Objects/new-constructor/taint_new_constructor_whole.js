// @type taint
// @target es5 Object
// @feature syntax object-taint

function __test_taint__(tainted) {
    // tainted = {a:1}; the whole object is the taint source (prop 'a' present at taint time)
    // @witness __test_taint__({a: 1}) => tainted = {a:1} tainted
    __assert_taint__(tainted, true);
    // @witness __test_taint__({a: 1}) => tainted.a = 1 tainted
    __assert_taint__(tainted.a, true);

    // copying the tainted field into a clean object taints only that field
    var tnc_r = {a: 0, b: 0};
    tnc_r.a = tainted.a;
    // @witness mixed (tainted + clean) => not all-tainted, clean
    __assert_taint__(tnc_r, false);
    // @witness __test_taint__({a: 1}) => tnc_r.a = 1 tainted
    __assert_taint__(tnc_r.a, true);
}

__test_taint__(__set_taint__({a: 1}));
