// @type taint
// @target es5 String.prototype.match
// @feature builtin match
// done

function test(pat) {
    var x = 'hello123';
    var re = new RegExp(pat);

    var m = x.match(re);

    // @witness 'hello123' clean; tainted pat is only the regexp (pattern not in result)
    __assert_taint__(m[0], false);
}

var pat = '\\d+';
__set_taint__(pat);

test(pat);
