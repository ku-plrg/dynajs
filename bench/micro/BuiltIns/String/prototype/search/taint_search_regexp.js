// @type taint
// @target es5 String.prototype.search
// @feature builtin search
// done

function test(pat) {
    var x = 'hello123';
    var re = new RegExp(pat);

    // @witness tainted pat is only the regexp pattern; search returns a position number
    __assert_taint__(x.search(re), false);
}

var pat = '[0-9]';
__set_taint__(pat);
test(pat);
