(function (D$) {

  var builder = new D$.utils.StringBuilder(false /* prevent RangeError */);
  /** @param {string} str */
  function put(str) { console.log(builder.put(str)); }

  const MAX_STRING_LENGTH = 20;
  /** @param {any} v */
  function getValue(v) {
    var type = typeof v;
    if (v instanceof RegExp) {
      return v.toString();
    } else if (Array.isArray(v)) {
      return "<array>";
    } else if ((type === "object" || type === "function") && v !== null) {
      return "<" + type + ">";
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

  /** @param {number} id */
  function getLoc(id) {
    return ' @ ' + D$.idToLoc(id);
  }

  D$.analysis = {
    endExecution: function () {
      var result = builder.result;
      D$.analysis.result = result;
    },

    // literal group
    literal: function (id, value) {
      put('literal(' + getValue(value) + ')' + getLoc(id));
    },
    numberLiteral: function (id, value) {
      put('numberLiteral(' + getValue(value) + ')' + getLoc(id));
    },
    bigintLiteral: function (id, value) {
      put('bigintLiteral(' + getValue(value) + ')' + getLoc(id));
    },
    stringLiteral: function (id, value) {
      put('stringLiteral(' + getValue(value) + ')' + getLoc(id));
    },
    booleanLiteral: function (id, value) {
      put('booleanLiteral(' + getValue(value) + ')' + getLoc(id));
    },
    nullLiteral: function (id, value) {
      put('nullLiteral(' + getValue(value) + ')' + getLoc(id));
    },
    regexpLiteral: function (id, value) {
      put('regexpLiteral(' + getValue(value) + ')' + getLoc(id));
    },
    arrayLiteral: function (id, value) {
      put('arrayLiteral(' + getValue(value) + ')' + getLoc(id));
    },
    objectLiteral: function (id, value) {
      put('objectLiteral(' + getValue(value) + ')' + getLoc(id));
    },
    functionLiteral: function (id, value) {
      put('functionLiteral(' + getValue(value) + ')' + getLoc(id));
    },

    // binary group
    binaryPre: function (id, op, left, right) {
      put('binaryPre(' + op + ', ' + getValue(left) + ', ' + getValue(right) + ')' + getLoc(id));
    },
    binary: function (id, op, left, right, result) {
      put('binary(' + op + ', ' + getValue(left) + ', ' + getValue(right) + ', ' + getValue(result) + ')' + getLoc(id));
    },
    arithmeticBinaryPre: function (id, op, left, right) {
      put('arithmeticBinaryPre(' + op + ', ' + getValue(left) + ', ' + getValue(right) + ')' + getLoc(id));
    },
    arithmeticBinary: function (id, op, left, right, result) {
      put('arithmeticBinary(' + op + ', ' + getValue(left) + ', ' + getValue(right) + ', ' + getValue(result) + ')' + getLoc(id));
    },
    comparisonBinaryPre: function (id, op, left, right) {
      put('comparisonBinaryPre(' + op + ', ' + getValue(left) + ', ' + getValue(right) + ')' + getLoc(id));
    },
    comparisonBinary: function (id, op, left, right, result) {
      put('comparisonBinary(' + op + ', ' + getValue(left) + ', ' + getValue(right) + ', ' + getValue(result) + ')' + getLoc(id));
    },
    bitwiseBinaryPre: function (id, op, left, right) {
      put('bitwiseBinaryPre(' + op + ', ' + getValue(left) + ', ' + getValue(right) + ')' + getLoc(id));
    },
    bitwiseBinary: function (id, op, left, right, result) {
      put('bitwiseBinary(' + op + ', ' + getValue(left) + ', ' + getValue(right) + ', ' + getValue(result) + ')' + getLoc(id));
    },

    // unary group
    unaryPre: function (id, op, prefix, operand) {
      var opStr = prefix ? op + ' _' : '_ ' + op;
      put('unaryPre(' + opStr + ', ' + getValue(operand) + ')' + getLoc(id));
    },
    unary: function (id, op, prefix, operand, result) {
      var opStr = prefix ? op + ' _' : '_ ' + op;
      put('unary(' + opStr + ', ' + getValue(operand) + ', ' + getValue(result) + ')' + getLoc(id));
    },
    arithmeticUnaryPre: function (id, op, prefix, operand) {
      var opStr = prefix ? op + ' _' : '_ ' + op;
      put('arithmeticUnaryPre(' + opStr + ', ' + getValue(operand) + ')' + getLoc(id));
    },
    arithmeticUnary: function (id, op, prefix, operand, result) {
      var opStr = prefix ? op + ' _' : '_ ' + op;
      put('arithmeticUnary(' + opStr + ', ' + getValue(operand) + ', ' + getValue(result) + ')' + getLoc(id));
    },
    logicalUnaryPre: function (id, op, prefix, operand) {
      var opStr = prefix ? op + ' _' : '_ ' + op;
      put('logicalUnaryPre(' + opStr + ', ' + getValue(operand) + ')' + getLoc(id));
    },
    logicalUnary: function (id, op, prefix, operand, result) {
      var opStr = prefix ? op + ' _' : '_ ' + op;
      put('logicalUnary(' + opStr + ', ' + getValue(operand) + ', ' + getValue(result) + ')' + getLoc(id));
    },
    bitwiseUnaryPre: function (id, op, prefix, operand) {
      var opStr = prefix ? op + ' _' : '_ ' + op;
      put('bitwiseUnaryPre(' + opStr + ', ' + getValue(operand) + ')' + getLoc(id));
    },
    bitwiseUnary: function (id, op, prefix, operand, result) {
      var opStr = prefix ? op + ' _' : '_ ' + op;
      put('bitwiseUnary(' + opStr + ', ' + getValue(operand) + ', ' + getValue(result) + ')' + getLoc(id));
    },
    typeofUnaryPre: function (id, op, prefix, operand) {
      var opStr = prefix ? op + ' _' : '_ ' + op;
      put('typeofUnaryPre(' + opStr + ', ' + getValue(operand) + ')' + getLoc(id));
    },
    typeofUnary: function (id, op, prefix, operand, result) {
      var opStr = prefix ? op + ' _' : '_ ' + op;
      put('typeofUnary(' + opStr + ', ' + getValue(operand) + ', ' + getValue(result) + ')' + getLoc(id));
    },
    voidUnaryPre: function (id, op, prefix, operand) {
      var opStr = prefix ? op + ' _' : '_ ' + op;
      put('voidUnaryPre(' + opStr + ', ' + getValue(operand) + ')' + getLoc(id));
    },
    voidUnary: function (id, op, prefix, operand, result) {
      var opStr = prefix ? op + ' _' : '_ ' + op;
      put('voidUnary(' + opStr + ', ' + getValue(operand) + ', ' + getValue(result) + ')' + getLoc(id));
    },
    updateUnaryPre: function (id, op, prefix, operand) {
      var opStr = prefix ? op + ' _' : '_ ' + op;
      put('updateUnaryPre(' + opStr + ', ' + getValue(operand) + ')' + getLoc(id));
    },
    updateUnary: function (id, op, prefix, operand, result) {
      var opStr = prefix ? op + ' _' : '_ ' + op;
      put('updateUnary(' + opStr + ', ' + getValue(operand) + ', ' + getValue(result) + ')' + getLoc(id));
    },

    // condition group
    condition: function (id, op, value) {
      put('condition(' + op + ', ' + getValue(value) + ')' + getLoc(id));
    },
    ifCondition: function (id, value) {
      put('ifCondition(' + getValue(value) + ')' + getLoc(id));
    },
    whileCondition: function (id, value) {
      put('whileCondition(' + getValue(value) + ')' + getLoc(id));
    },
    forCondition: function (id, value) {
      put('forCondition(' + getValue(value) + ')' + getLoc(id));
    },
    ternaryCondition: function (id, value) {
      put('ternaryCondition(' + getValue(value) + ')' + getLoc(id));
    },
    logicalAnd: function (id, value) {
      put('logicalAnd(' + getValue(value) + ')' + getLoc(id));
    },
    logicalOr: function (id, value) {
      put('logicalOr(' + getValue(value) + ')' + getLoc(id));
    },
    nullishCoalescing: function (id, value) {
      put('nullishCoalescing(' + getValue(value) + ')' + getLoc(id));
    },
    optionalChain: function (id, value) {
      put('optionalChain(' + getValue(value) + ')' + getLoc(id));
    },
    switchCondition: function (id, value) {
      put('switchCondition(' + getValue(value) + ')' + getLoc(id));
    },

    // memory group
    memoryAccess: function (id, value) {
      put('memoryAccess(' + getValue(value) + ')' + getLoc(id));
    },
    read: function (id, name, value) {
      put('read(' + name + ', ' + getValue(value) + ')' + getLoc(id));
    },
    memoryWrite: function (id, value) {
      put('memoryWrite(' + getValue(value) + ')' + getLoc(id));
    },
    write: function (id, names, value) {
      put('write([' + names.join(', ') + '], ' + getValue(value) + ')' + getLoc(id));
    },
    getField: function (id, base, prop, value) {
      put('getField(' + getValue(base) + ', ' + getValue(prop) + ', ' + getValue(value) + ')' + getLoc(id));
    },
    putField: function (id, base, prop, value) {
      put('putField(' + getValue(base) + ', ' + getValue(prop) + ', ' + getValue(value) + ')' + getLoc(id));
    },
  };
})(D$);
