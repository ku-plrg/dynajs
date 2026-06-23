// @type taint
// @target es5 new-constructor
// @feature syntax constructor-inherit

function TNC_Person(first, last) {
    this.name = {first: first, last: last};
}
TNC_Person.prototype.greeting = function () {
    return this.name.first;
};
function TNC_Teacher(first, last, subject) {
    TNC_Person.call(this, first, last);
    this.subject = subject;
}
TNC_Teacher.prototype = Object.create(TNC_Person.prototype);

function __test_taint__(tainted) {
    var tnc_p = new TNC_Person(tainted, 'b');
    // @witness __test_taint__('a') => tnc_p.name.first = 'a' tainted
    __assert_taint__(tnc_p.name.first, true);
    // @witness clean ctor arg 'b', clean
    __assert_taint__(tnc_p.name.last, false);
    // @witness __test_taint__('a') => tnc_p.greeting() = 'a' tainted
    __assert_taint__(tnc_p.greeting(), true);

    var tnc_t = new TNC_Teacher(tainted, 'b', 'sec');
    // @witness __test_taint__('a') => tnc_t.name.first = 'a' tainted
    __assert_taint__(tnc_t.name.first, true);
    // @witness clean ctor arg 'sec', clean
    __assert_taint__(tnc_t.subject, false);
    // @witness __test_taint__('a') => tnc_t.greeting() = 'a' tainted
    __assert_taint__(tnc_t.greeting(), true);
}

__test_taint__(__set_taint__('a'));
