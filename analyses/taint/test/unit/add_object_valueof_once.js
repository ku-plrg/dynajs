// `o + 1` is executed solely by SYNTAX__add (binaryPre suppresses native for
// modeled ops), so the ToPrimitive side effect must fire exactly once.
var calls = 0;
var o = {
  valueOf: function () {
    calls++;
    return 5;
  },
};

var r = o + 1;

__assert__(calls === 1);
