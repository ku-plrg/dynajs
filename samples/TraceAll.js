(function (D$) {

  // NOTE setting the first argument of StringBuilder `false` disables string concat, to prevent RangeError (still prints to console)
  var builder = new D$.utils.StringBuilder(false);
  /** @param {string} str */
  function put(str) { console.log(builder.put(str)); }
  var indentIn = builder.indentIn;
  var indentOut = builder.indentOut;

  const MAX_STRING_LENGTH = 20;
  /** @param {any} v */
  function getValue(v) {
    var type = typeof v;
    if (v instanceof RegExp) {
      return v.toString();
    } else if (Array.isArray(v)) {
      return "<array>";
    } else if ((type === "object" || type === "function") && v !== null) {
      return "<" + type + ">"; // TODO: improve object printing with addresses
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
    scriptEnter: function (id, instrumentedPath, originalPath) {
      var loc = getLoc(id);
      put('Se()' + loc);
      indentIn();
    },
    scriptExit: function (id, exc) {
      indentOut();
      var loc = getLoc(id);
      if (exc) {
        var e = getValue(exc.exception);
        put('Sx(' + e + ')' + loc);
      } else {
        put('Sx()' + loc);
      }
    },
    invokeFunPre: function (id, f, base, args, isConstructor, isMethod) {
      var str = 'F[pre](' + getValue(f) + ', ' + getValue(base) + ', [';
      for (var i = 0; i < args.length; i++) {
        if (i > 0) str += ', ';
        str += getValue(args[i]);
      }
      str += '], ' + isConstructor + ', ' + isMethod + ')';
      put(str + getLoc(id));
    },
    invokeFun: function (id, f, base, args, result, isConstructor, isMethod) {
      var str = 'F(' + getValue(f) + ', ' + getValue(base) + ', [';
      for (var i = 0; i < args.length; i++) {
        if (i > 0) str += ', ';
        str += getValue(args[i]);
      }
      str += '], ' + getValue(result)
      str += ', ' + isConstructor + ', ' + isMethod + ')';
      put(str + getLoc(id));
    },
    taggedTemplatePre: function (id, f, base, strings, values, isMethod) {
      var str = 'TT[pre](' + getValue(f) + ', ' + getValue(base) + ', ' + getValue(strings) + ', [';
      for (var i = 0; i < values.length; i++) {
        if (i > 0) str += ', ';
        str += getValue(values[i]);
      }
      str += '], ' + isMethod + ')';
      put(str + getLoc(id));
    },
    taggedTemplate: function (id, f, base, strings, values, result, isMethod) {
      var str = 'TT(' + getValue(f) + ', ' + getValue(base) + ', ' + getValue(strings) + ', [';
      for (var i = 0; i < values.length; i++) {
        if (i > 0) str += ', ';
        str += getValue(values[i]);
      }
      str += '], ' + getValue(result) + ', ' + isMethod + ')';
      put(str + getLoc(id));
    },
    templateConcatPre: function (id, left, right) {
      put('TL[pre](' + getValue(left) + ', ' + getValue(right) + ')' + getLoc(id));
    },
    templateConcat: function (id, left, right, result) {
      put('TL(' + getValue(left) + ', ' + getValue(right) + ', ' + getValue(result) + ')' + getLoc(id));
    },
    functionEnter: function (id, f, base, args, isAsync, isGenerator) {
      var str = 'Fe(' + getValue(f) + ', ' + getValue(base) + ', [';
      for (var i = 0; i < args.length; i++) {
        if (i > 0) str += ', ';
        str += getValue(args[i]);
      }
      str += '])';
      put(str + getLoc(id));
      indentIn();
    },
    functionExit: function (id, returnVal, exc, isAsync, isGenerator) {
      indentOut();
      var loc = getLoc(id);
      if (exc) {
        var e = getValue(exc.exception);
        put('Fx(' + e + ')' + loc);
      } else {
        var r = getValue(returnVal);
        put('Fx(' + r + ')' + loc);
      }
    },
    _return: function (id, value) {
      var v = getValue(value);
      var loc = getLoc(id);
      put('Re(' + v + ')' + loc);
    },
    forInOfObject: function (id, obj, isForIn) {
      var o = getValue(obj);
      var loc = getLoc(id);
      put('O(' + (isForIn ? 'forIn' : 'forOf') + ', ' + o + ')' + loc);
    },
    endExpression: function (id, value) {
      var v = getValue(value);
      var loc = getLoc(id);
      put('E(' + v + ')' + loc);
    },
    getFieldPre: function (id, base, prop) {
      var b = getValue(base);
      var p = getValue(prop);
      var loc = getLoc(id);
      put('G[pre](' + b + ', ' + p + ')' + loc);
    },
    getField: function (id, base, prop, value) {
      var b = getValue(base);
      var p = getValue(prop);
      var v = getValue(value);
      var loc = getLoc(id);
      put('G(' + b + ', ' + p + ', ' + v + ')' + loc);
    },
    putFieldPre: function (id, base, prop, value) {
      var b = getValue(base);
      var p = getValue(prop);
      var v = getValue(value);
      var loc = getLoc(id);
      put('P[pre](' + b + ', ' + p + ', ' + v + ')' + loc);
    },
    putField: function (id, base, prop, value) {
      var b = getValue(base);
      var p = getValue(prop);
      var v = getValue(value);
      var loc = getLoc(id);
      put('P(' + b + ', ' + p + ', ' + v + ')' + loc);
    },
    _deletePre: function (id, base, prop) {
      var b = getValue(base);
      var p = getValue(prop);
      var loc = getLoc(id);
      put('De[pre](' + b + ', ' + p + ')' + loc);
    },
    _delete: function (id, base, prop, result) {
      var b = getValue(base);
      var p = getValue(prop);
      var r = getValue(result);
      var loc = getLoc(id);
      put('De(' + b + ', ' + p + ', ' + r + ')' + loc);
    },
    unaryPre: function (id, op, prefix, operand) {
      var l = getValue(operand);
      var loc = getLoc(id);
      op = prefix ? op + ' _' : '_ ' + op;
      put('U[pre](' + op + ', ' + l + ')' + loc);
    },
    unary: function (id, op, prefix, operand, result) {
      var l = getValue(operand);
      var res = getValue(result);
      var loc = getLoc(id);
      op = prefix ? op + ' _' : '_ ' + op;
      put('U(' + op + ', ' + l + ', ' + res + ')' + loc);
    },
    binaryPre: function (id, op, left, right) {
      var l = getValue(left);
      var r = getValue(right);
      var loc = getLoc(id);
      put('B[pre](' + op + ', ' + l + ', ' + r + ')' + loc);
    },
    binary: function (id, op, left, right, result) {
      var l = getValue(left);
      var r = getValue(right);
      var res = getValue(result);
      var loc = getLoc(id);
      put('B(' + op + ', ' + l + ', ' + r + ', ' + res + ')' + loc);
    },
    condition: function (id, op, value) {
      var v = getValue(value);
      var loc = getLoc(id);
      put('C(' + op + ', ' + v + ')' + loc);
    },
    declare: function (id, name, kind, init, value, isSpread) {
      var loc = getLoc(id);
      var initStr = init ? ', ' + getValue(value) : '';
      put('D(' + name + ', <' + kind + '>' + initStr + ', ' + isSpread + ')' + loc);
    },
    read: function (id, name, value) {
      var v = getValue(value);
      var loc = getLoc(id);
      put('R(' + name + ', ' + v + ')' + loc);
    },
    write: function (id, names, value) {
      var v = getValue(value);
      var loc = getLoc(id);
      put('W([' + names.join(', ') + '], ' + v + ')' + loc);
    },
    literal: function (id, value) {
      var v = getValue(value);
      var loc = getLoc(id);
      put('L(' + v + ')' + loc);
    },
    _throw: function (id, value) {
      var v = getValue(value);
      var loc = getLoc(id);
      put('T(' + v + ')' + loc);
    },
    _yield: function (id, value, isDelegate) {
      indentOut();
      var v = getValue(value);
      var loc = getLoc(id);
      var prefix = isDelegate ? 'yield*' : 'yield';
      put('Y(' + prefix + ', ' + v + ')' + loc);
    },
    _resume: function (id, value) {
      var v = getValue(value);
      var loc = getLoc(id);
      put('Yr(' + v + ')' + loc);
      indentIn();
    },
    _await: function (id, value) {
      indentOut();
      var v = getValue(value);
      var loc = getLoc(id);
      put('Aw(' + v + ')' + loc);
    },
    _awaitResult: function (id, value) {
      var v = getValue(value);
      var loc = getLoc(id);
      put('Awr(' + v + ')' + loc);
      indentIn();
    },
    fieldInit: function (id, obj, key, isStatic, value) {
      var v = getValue(value);
      var loc = getLoc(id);
      put('Fi(' + (isStatic ? 'static ' : '') + key + ' = ' + v + ')' + loc);
    },
    superCallPre: function (id, args) {
      var str = 'Su[pre]([';
      for (var i = 0; i < args.length; i++) {
        if (i > 0) str += ', ';
        str += getValue(args[i]);
      }
      str += '])';
      put(str + getLoc(id));
    },
    superCall: function (id, args, thisVal) {
      var str = 'Su([';
      for (var i = 0; i < args.length; i++) {
        if (i > 0) str += ', ';
        str += getValue(args[i]);
      }
      str += '], ' + getValue(thisVal) + ')';
      put(str + getLoc(id));
    },
    superMethodCallPre: function (id, thisVal, prop, args) {
      var str = 'Sm[pre](' + getValue(thisVal) + ', ' + getValue(prop) + ', [';
      for (var i = 0; i < args.length; i++) {
        if (i > 0) str += ', ';
        str += getValue(args[i]);
      }
      str += '])';
      put(str + getLoc(id));
    },
    superMethodCall: function (id, thisVal, prop, args, result) {
      var str = 'Sm(' + getValue(thisVal) + ', ' + getValue(prop) + ', [';
      for (var i = 0; i < args.length; i++) {
        if (i > 0) str += ', ';
        str += getValue(args[i]);
      }
      str += '], ' + getValue(result) + ')';
      put(str + getLoc(id));
    },
    superGetFieldPre: function (id, thisVal, prop) {
      put('Gs[pre](' + getValue(thisVal) + ', ' + getValue(prop) + ')' + getLoc(id));
    },
    superGetField: function (id, thisVal, prop, value) {
      put('Gs(' + getValue(thisVal) + ', ' + getValue(prop) + ', ' + getValue(value) + ')' + getLoc(id));
    },
    superPutFieldPre: function (id, thisVal, prop, value) {
      put('Ps[pre](' + getValue(thisVal) + ', ' + getValue(prop) + ', ' + getValue(value) + ')' + getLoc(id));
    },
    superPutField: function (id, thisVal, prop, value) {
      put('Ps(' + getValue(thisVal) + ', ' + getValue(prop) + ', ' + getValue(value) + ')' + getLoc(id));
    },
    instrumentCodePre: function (id, code, isDirect) {
      var v = getValue(code);
      var loc = getLoc(id);
      put('Ev[pre](' + v + ', ' + isDirect + ')' + loc);
    },
    instrumentCode: function (id, code, isDirect) {
      var v = getValue(code);
      var loc = getLoc(id);
      put('Ev(' + v + ', ' + isDirect + ')' + loc);
    },
  }
})(D$);
