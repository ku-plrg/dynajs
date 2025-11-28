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
    return D$.idToLoc(id);
  }

  D$.analysis = {
    literal: function (id, val) {
      builder.put('L(' + getValue(val) + ') @ ' + getLoc(id));
    },
    endExpression: function (id, value) {
      builder.put('E(' + getValue(value) + ') @ ' + getLoc(id));
    },
    scriptEnter: function (id, instrumentedPath, originalPath) {
      builder.put('Se() @ ' + getLoc(id));
      indentIn();
    },
    scriptExit: function (id, exc) {
      indentOut();
      if (exc) {
        builder.put('Sx(' + getValue(exc) + ') @ ' + getLoc(id));
      } else {
        builder.put('Sx() @ ' + getLoc(id));
      }
    },
    endExecution: function () {
      var result = builder.result;
      console.log(result);
      D$.analysis.result = result;
    },
  }
})(D$);
