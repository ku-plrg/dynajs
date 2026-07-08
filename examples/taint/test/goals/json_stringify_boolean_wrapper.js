// Boxed primitive: JSON.stringify reads the [[BooleanData]] slot and serializes
// the underlying primitive -> "true". Validates the esmeta gen-poly fix for
// boxed-primitive data-slot reads (emits `$.base($.peek(v).valueOf(), [v])`
// instead of the dead `v["BooleanData"]`). Correctness check, no taint involved.
var b = new Boolean(true);

var out = JSON.stringify(b); // => "true"

__assert__(out === 'true');
