// @type taint
// @target es6+ String.prototype.matchAll
// @feature builtin matchAll
// done

function test(pat) {
    var x = 'a1b2c3';
    var re = new RegExp(pat, 'g');

    var arr = [...x.matchAll(re)];

    // @witness 'a1b2c3' clean; tainted pat is only the regexp (pattern not in result)
    __assert_taint__(arr[0][0], false);

    // @witness 'a1b2c3' clean; tainted pat is only the regexp (pattern not in result)
    __assert_taint__(arr[1][0], false);
}

var pat = '\\d';
__set_taint__(pat);

test(pat);
