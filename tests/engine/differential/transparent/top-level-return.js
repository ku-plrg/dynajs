// CommonJS allows `return` at module top level (Node wraps the file in a
// function). Instrumentation must parse and preserve it.
console.log('before');
if (typeof module !== 'undefined') return;
console.log('unreachable');
