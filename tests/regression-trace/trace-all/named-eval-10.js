// compound assignment (+=) — named eval must NOT apply (only plain = triggers it)
var f = function () {};
f += 0;
