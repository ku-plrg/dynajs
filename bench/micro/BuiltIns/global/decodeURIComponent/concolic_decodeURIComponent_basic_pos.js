// @type concolic
// @target es5 global.decodeURIComponent
// @feature builtin decodeuricomponent

function __test_symbolic__(symbolic) {
    if (symbolic.indexOf("%") !== -1) {
        var decoded = decodeURIComponent(symbolic);
        // @witness decodeURIComponent collapses each %XX escape to <=1 char, so output never grows
        __IS_SAT__(decoded.length > symbolic.length, false);
    } else {
        __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', "a%20b"));
