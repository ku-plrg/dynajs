// @type taint
// @target es5 String.prototype.replace
// @feature builtin replace
// done

function test(s) {
    var x = 'hello world';

    var r = x.replace(s, 'there');

    // @witness 'hello world' clean; tainted s is the searchValue (removed, not in result)
    __assert_taint__(r[0], false);

    // @witness always r[r.length-1]='e' clean suffix from literal replacement
    __assert_taint__(r[r.length-1], false);
}

var s = 'world';
__set_taint__(s);

test(s);
