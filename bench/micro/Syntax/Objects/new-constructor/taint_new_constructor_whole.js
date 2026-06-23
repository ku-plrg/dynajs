// @type taint
// @target es5 Object
// @feature syntax object-taint

function __test_taint__(tainted) {
    // tainted = {a:1}; the whole object is the taint source (prop 'a' present at taint time)
    // @witness whole object is the source => container tainted
    __assert_taint__(tainted, true);
    // @witness existing prop tainted by whole-object taint (coarse down-propagation)
    __assert_taint__(tainted.a, true);

    // copying the tainted field into a clean object taints only that field
    var tnc_r = {a: 0, b: 0};
    tnc_r.a = tainted.a;
    // @witness clean container, mixed props => not all-tainted
    __assert_taint__(tnc_r, false);
    // @witness copied field carries the taint
    __assert_taint__(tnc_r.a, true);
}

__test_taint__(__set_taint__({a: 1}));
