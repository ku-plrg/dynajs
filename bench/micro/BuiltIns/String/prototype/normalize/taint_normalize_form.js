// @type taint
// @target es6+ String.prototype.normalize
// @feature builtin normalize

function test(f) {
    var x = 'foo';

    // @witness 'foo' clean; tainted f is only the form selector
    __assert_taint__(x.normalize(f)[0], false);

    // @witness 'foo' clean; tainted f is only the form selector
    __assert_taint__(x.normalize(f)[1], false);

    // @witness 'foo' clean; tainted f is only the form selector
    __assert_taint__(x.normalize(f)[2], false);
}

var f = 'NFC';
__set_taint__(f);

test(f);
