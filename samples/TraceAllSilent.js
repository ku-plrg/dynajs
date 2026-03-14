(function (D$) {

  D$.analysis = {
    endExecution: function () {
    },
    scriptEnter: function (id, instrumentedPath, originalPath) {
    },
    scriptExit: function (id, exc) {
    },
    invokeFunPre: function (id, f, base, args, isConstructor, isMethod) {
    },
    invokeFun: function (id, f, base, args, result, isConstructor, isMethod) {
    },
    taggedTemplatePre: function (id, f, base, strings, values, isMethod) {
    },
    taggedTemplate: function (id, f, base, strings, values, result, isMethod) {
    },
    functionEnter: function (id, f, base, args) {
    },
    functionExit: function (id, returnVal, exc) {
    },
    _return: function (id, value) {
    },
    forInOfObject: function (id, obj, isForIn) {
    },
    endExpression: function (id, value) {
    },
    getFieldPre: function (id, base, prop) {
    },
    getField: function (id, base, prop, value) {
    },
    putFieldPre: function (id, base, prop, value) {
    },
    putField: function (id, base, prop, value) {
    },
    _deletePre: function (id, base, prop) {
    },
    _delete: function (id, base, prop, result) {
    },
    unaryPre: function (id, op, prefix, operand) {
    },
    unary: function (id, op, prefix, operand, result) {
    },
    binaryPre: function (id, op, left, right) {
    },
    binary: function (id, op, left, right, result) {
    },
    condition: function (id, op, value) {
    },
    declare: function (id, name, kind, init, value, isSpread) {
    },
    read: function (id, name, value) {
    },
    write: function (id, names, value) {
    },
    literal: function (id, value) {
    },
    _throw: function (id, value) {
    },
    _yield: function (id, value, isDelegate) {
    },
    _resume: function (id, value) {
    },
    _await: function (id, value) {
    },
    _awaitResult: function (id, value) {
    },
    fieldInit: function (id, obj, key, isStatic, value) {
    },
    staticBlockEnter: function (id, cls) {
    },
    staticBlockExit: function (id) {
    },
  }
})(D$);
