// @type taint
// @oracle true

function __print_if_tainted__(x) {
  if (__is_tainted__(x)) {
    console.log('@@DJX_VERDICT detected');
  } else {
    console.log('@@DJX_VERDICT clean');
  }
}

var x = 'asdf';

__set_taint__(x);

var y = x;

__print_if_tainted__(y);