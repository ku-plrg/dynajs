// @type taint
// @target es6+ String.prototype.replaceAll
// @feature builtin replaceAll
// done

function test(s) {
    var x = 'a-b-c';

    var r = x.replaceAll(s, '+');

    // @witness 'a-b-c' clean; tainted s is the searchValue (removed, not in result)
    __assert_taint__(r[0], false);

    // @witness always r[1]='+' from literal replacement
    __assert_taint__(r[1], false);

    // @witness always r[3]='+' from literal replacement
    __assert_taint__(r[3], false);
}

var s = '-';
__set_taint__(s);

test(s);
