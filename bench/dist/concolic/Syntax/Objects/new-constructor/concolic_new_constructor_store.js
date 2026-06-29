// @type concolic
// @target es6+ new-constructor
// @feature syntax new-constructor

function NC_Point(v) {
  this.v = v;
}

function __test_symbolic__(symbolic) {
    var nc_p = new NC_Point(symbolic);
    if (symbolic === 5) {
      // @witness the symbolic === 5 guard forces nc_p.v === 5
      __IS_SAT__(nc_p.v !== 5, false);
    } else {
      __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', 5));
