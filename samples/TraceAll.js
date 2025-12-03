(function (D$) {

  var builder = new D$.utils.StringBuilder();
  var put = builder.put;
  var indentIn = builder.indentIn;
  var indentOut = builder.indentOut;

  const MAX_STRING_LENGTH = 20;
  function getValue(v) {
    var type = typeof v;
    if (v instanceof RegExp) {
      return v.toString();
    } else if ((type === "object" || type === "function") && v !== null) {
      return type; // TODO: improve object printing with addresses
    } else {
      if (type === "string" && v.length > MAX_STRING_LENGTH) {
        v = v.substring(0, MAX_STRING_LENGTH) + "...";
      }
      return JSON.stringify(v, function (key, value) {
        if (typeof value === 'bigint') {
          return value.toString() + 'n';
        }
        return value;
      }, 2);
    }
  }

  function getLoc(id) {
    return ' @ ' + D$.idToLoc(id);
  }

  D$.analysis = {
    endExpression: function (id, value) {
      var v = getValue(value);
      var loc = getLoc(id);
      builder.put('E(' + v + ')' + loc);
    },
    binaryPre: function (id, op, left, right) {
      var l = getValue(left);
      var r = getValue(right);
      var loc = getLoc(id);
      builder.put('B[pre](' + op + ', ' + l + ', ' + r + ')' + loc);
    },
    binaryPost: function (id, op, left, right, result) {
      var l = getValue(left);
      var r = getValue(right);
      var res = getValue(result);
      var loc = getLoc(id);
      builder.put('B(' + op + ', ' + l + ', ' + r + ', ' + res + ')' + loc);
    },
    unaryPre: function (id, op, operand) {
      var l = getValue(operand);
      var loc = getLoc(id);
      builder.put('U[pre](' + op + ', ' + l + ')' + loc);
    },
    unaryPost: function (id, op, operand, result) {
      var l = getValue(operand);
      var res = getValue(result);
      var loc = getLoc(id);
      builder.put('U(' + op + ', ' + l + ', ' + res + ')' + loc);
    },
    conditional: function (id, op, value) {
      var v = getValue(value);
      var loc = getLoc(id);
      builder.put('C(' + op + ', ' + v + ')' + loc);
    },
    declare: function (id, name, kind) {
      var loc = getLoc(id);
      builder.put('D(' + name + ', ' + kind + ')' + loc);
    },
    read: function (id, name, val) {
      var v = getValue(val);
      var loc = getLoc(id);
      builder.put('R(' + name + ', ' + v + ')' + loc);
    },
    write: function (id, names, val) {
      var v = getValue(val);
      var loc = getLoc(id);
      builder.put('W([' + names.join(', ') + '], ' + v + ')' + loc);
    },
    literal: function (id, val) {
      var v = getValue(val);
      var loc = getLoc(id);
      builder.put('L(' + v + ')' + loc);
    },
    scriptEnter: function (id, instrumentedPath, originalPath) {
      var loc = getLoc(id);
      builder.put('Se()' + loc);
      indentIn();
    },
    scriptExit: function (id, exc) {
      indentOut();
      var loc = getLoc(id);
      if (exc) {
        var e = getValue(exc);
        builder.put('Sx(' + e + ')' + loc);
      } else {
        builder.put('Sx()' + loc);
      }
    },
    endExecution: function () {
      var result = builder.result;
      console.log(result);
      D$.analysis.result = result;
    },
  }
})(D$);
