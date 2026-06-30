// Concolic model of String.prototype.trim/trimStart/trimEnd ($.trim via
// AO__TrimString). trim(s) is a substring of s, so its length never exceeds
// len(s) and z3 can relate the two through the whiteLeft/whiteRight encoding.
// Single-path: each block's seed must be coherent with the branch it takes.

// trim() strips both ends, so a 3-char trimmed result implies the source is at
// least 3 chars long. Provable under the recursive-trim model.
{
  const s = __symbolic__('trim_both', '  abc  ');
  if (s.trim() === 'abc') {
    __symbolic_assert__(s.length >= 3, true);
  }
}

// trimStart() only strips the left, so the result's last char is the source's
// last char: if the trimmed value ends in 'x', so does s. Provable.
{
  const s = __symbolic__('trim_start', '  ax');
  if (s.trimStart() === 'ax') {
    __symbolic_assert__(s.length >= 2, true);
  }
}

// trimEnd() strips the right (corrected off-by-one vs ExpoSE), so trimming a
// known result still leaves the length only loosely pinned: len(s) === 2 is NOT
// implied by trimEnd(s) === 'hi' (s could be 'hi   '), so it stays falsifiable.
{
  const s = __symbolic__('trim_end', 'hi ');
  if (s.trimEnd() === 'hi') {
    __symbolic_assert__(s.length === 2, false);
  }
}
