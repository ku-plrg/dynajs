// @type concolic
// @target es6+ String.raw
// @feature builtin raw-static

function __test_symbolic__(symbolic) {
    var r = String.raw`a${symbolic}b`;
    if (r.length === 3) {
        // @witness the r.length===3 guard pins 'a'+symbolic+'b' to symbolic.length===1
        __IS_SAT__(symbolic.length !== 1, false);
    }
}

__test_symbolic__(__symbolic__('s', "q"));
