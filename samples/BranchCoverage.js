/**
 * BranchCoverage — records how many times each branch condition evaluated to
 * true vs. false (covers if, while, for, do-while, ?:, &&, ||, ??).
 *
 * In DynaJS the `condition` callback fires for every conditional expression.
 * The `op` parameter identifies the kind (e.g. 'if', 'while', '?', '&&', …).
 */

(function (D$) {
  /** @type {Record<string, { id: number, op: string, trueCount: number, falseCount: number }>} */
  var branches = {};

  D$.analysis = {
    condition: function (id, op, value) {
      var key = id + ':' + op;
      if (!branches[key]) {
        branches[key] = { id: id, op: op, trueCount: 0, falseCount: 0 };
      }
      if (value) {
        branches[key].trueCount++;
      } else {
        branches[key].falseCount++;
      }
    },

    endExecution: function () {
      var keys = Object.keys(branches);
      for (var i = 0; i < keys.length; i++) {
        var b = branches[keys[i]];
        console.log(
          'At ' + D$.idToLoc(b.id) + ' [' + b.op + ']' +
          ' true=' + b.trueCount +
          ' false=' + b.falseCount
        );
      }
    },
  };
})(D$);
