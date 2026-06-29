// @type taint
// @target es5 new-constructor
// @feature syntax constructor-inherit
// @done

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

    var tnc_t = new TNC_Teacher(tainted, 'b', 'sec');
    // @witness clean ctor arg 'sec', clean
    __assert_taint__(tnc_t.subject, false);
}

__test_taint__(__set_taint__('a'));
