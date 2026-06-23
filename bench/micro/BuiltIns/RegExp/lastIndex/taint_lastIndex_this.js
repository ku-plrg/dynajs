// @type taint
// @target es5 RegExp.lastIndex
// @feature builtin lastIndex

function __test_taint__(tainted) {
    // lastIndex is a POSITION number — rule 4 position => false
    var re = /b/g;
    var str = 'a' + tainted + 'c';
    re.exec(str);
    var li = re.lastIndex;

    // @witness always lastIndex is a position number, not content
    __assert_taint__(li, false);
}

__test_taint__(__set_taint__('b'));
