// @type concolic
// @target es5 global.decodeURIComponent
// @feature builtin decodeuricomponent

function __test_symbolic__(symbolic) {
    // input carries no literal '<', yet a percent-escape can decode into one
    if (symbolic.indexOf("<") === -1) {
        var decoded = decodeURIComponent(symbolic);
        // @witness __test_symbolic__("%3C")
        __IS_SAT__(decoded.indexOf("<") !== -1, true);
    }
}

__test_symbolic__(__symbolic__('s', "%3C"));
