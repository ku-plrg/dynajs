/**
 * CheckNaN — reports locations where NaN values are observed as results of
 * function calls, field reads, binary operations, or unary operations.
 */

(function (D$) {
  /** @type {Record<string, number>} */
  var info = {};

  /** @param {number} id */
  function record(id) {
    info[id] = (info[id] | 0) + 1;
  }

  D$.analysis = {
    invokeFun: function (id, f, base, args, result, isConstructor, isMethod) {
      if (result !== result) record(id);
    },

    getField: function (id, base, prop, value) {
      if (value !== value) record(id);
    },

    binary: function (id, op, left, right, result) {
      if (result !== result) record(id);
    },

    unary: function (id, op, prefix, operand, result) {
      if (result !== result) record(id);
    },

    endExecution: function () {
      var ids = Object.keys(info).sort(function (a, b) { return info[b] - info[a]; });
      for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        console.log('Observed NaN at ' + D$.idToLoc(Number(id)) + ' ' + info[id] + ' time(s).');
      }
    },
  };
})(D$);
