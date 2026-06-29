// @type concolic
// @target es6+ new-constructor
// @feature syntax new-constructor

function NC_Box(v) {
  this.dbl = v + v;
}

function __test_symbolic__(symbolic) {
    var nc_b = new NC_Box(symbolic);
    if (symbolic === 5) {
      // @witness the symbolic === 5 guard forces nc_b.dbl === 10
      __IS_SAT__(nc_b.dbl !== 10, false);
    } else {
      __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', 5));
