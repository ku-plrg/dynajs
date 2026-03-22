(function(){

    globalThis.__level = globalThis.__level ?? 0;

    function noSideEffectStringify(val) {
        switch (typeof val) {
            case 'string':  return val;
            case 'number':  return val.toString();
            case 'boolean': return val.toString();
            case 'undefined': return 'undefined';
            case 'object': return val === null ? 'null' : '<object>';
            case 'function': return '<function>';
        }
    }

    function specToString(val) {
        if (typeof val === 'symbol') {
            return val.toString();
        }
        return String(new String(val));
    }

    function stringify(val) {
        console.log(JSON.stringify(val));
    }

    var isDynaJS = typeof D$ !== "undefined";

    // Pick the analysis object depending on whether we are running under Jalangi or DynaJS
    var analysisObj = (function () {
        return isDynaJS ? D$ : J$;
    })();


    analysisObj.analysis = {

        invokeFunPre: function (iid, f, base, args, isConstructor, isMethod) {
            var isCallable = typeof f === 'function';
            var fname = isCallable ? f.name : '<not callable>';
            stringify({ type: "invokeFunPre", f: fname, level: __level });
            ++__level;
            return { f: f, base: base, args: args, skip: false };
        },

        invokeFun: function (iid, f, base, args, result, isConstructor, isMethod) {
            var isCallable = typeof f === 'function';
            var fname = isCallable ? f.name : '<not callable>';
            stringify({ type: "invokeFun", f: fname, level: __level });
            --__level;
            return { result: result };
        },

        literal: function (iid, val) {
            stringify({ type: "literal", valueType: typeof val, level: __level });
            return { result: val };
        },

        forInOfObject: function (iid, val, isForIn) {
            var legacyTag = "forinObject";
            stringify({ type: legacyTag, obj: 'todo', level: __level });
            return { result: val };
        },

        declare: function (id, name, kind, init, value) {
            stringify({ type: "declare", name: name, level: __level });
        },

        getFieldPre: function (iid, base, prop) {
            var proptoString = typeof prop === 'object' || typeof prop === 'function' ? '<side effect>' : specToString(prop);
            stringify({ type: "getFieldPre", prop: proptoString, level: __level });
            ++__level;
            return { base: base, prop: prop, skip: false };
        },

        getField: function (iid, base, prop, result) {
            var proptoString = typeof prop === 'object' || typeof prop === 'function' ? '<side effect>' : specToString(prop);
            stringify({ type: "getField", prop: proptoString, level: __level });
            --__level;
            return { result };
        },

        putFieldPre: function (iid, base, prop, value) {
            var proptoString = typeof prop === 'object' || typeof prop === 'function' ? '<side effect>' : specToString(prop);
            stringify({ type: "putFieldPre", prop: proptoString, level: __level });
            ++__level;
            return { base, prop, value, skip: false };
        },

        putField: function (iid, base, prop, value) {
            var proptoString = typeof prop === 'object' || typeof prop === 'function' ? '<side effect>' : specToString(prop);
            stringify({ type: "putField", prop: proptoString, level: __level });
            --__level;
            return { result: value };
        },

        read: function (iid, name, val) {
            stringify({ type: "read", name: name, level: __level });
            return { result: val };
        },

        write: function (iid, names, val) {
            // dynajs supports ES6+ features so it gives name as an array - temporal hack for now
            stringify({ type: "write", name: names[0], level: __level });
            return { result: val };
        },

        // _return: function (iid, val) {
        //     return { result: val };
        // },

        // _throw: function (iid, val) {
        //     return { result: val };
        // },

        // _with: function (iid, val) {
        //     return { result: val };
        // },

        functionEnter: function (iid, f, base, args, isAsync, isGenerator) {
            stringify({ type: "functionEnter", fo: '', level: __level });
            ++__level;
        },

        functionExit: function (iid, returnVal, wrappedExceptionVal, isAsync, isGenerator) {
            stringify({ type: "functionExit", fo: 'todo', level: __level });
            --__level;
        },

        // scriptEnter: function (iid, instrumentedFileName, originalFileName) {
        // },

        // scriptExit: function (iid, wrappedExceptionVal) {
        //     return { wrappedExceptionVal: wrappedExceptionVal, isBacktrack: false };
        // },

        binaryPre: function (iid, op, left, right, isOpAssign, isSwitchCaseComparison, isComputed) {
            stringify({ type: "binaryPre", op, level: __level });
            ++__level;
            return { op: op, left: left, right: right, skip: false };
        },

        binary: function (iid, op, left, right, result, isOpAssign, isSwitchCaseComparison, isComputed, __isThrown) {
            stringify({ type: "binary", op, level: __level, isThrown: __isThrown });
            --__level;
            return { result: result };
        },

        unaryPre: function (iid, op, prefix, operand) {
            stringify({ type: "unaryPre", op, level: __level });
            ++__level;
            return { op: op, operand: operand, skip: false };
        },

        unary: function (iid, op, prefix, operand, result) {
            stringify({ type: "unary", op, level: __level });
            --__level;
            return { result: result };
        },

        // condition: function (id, op, value) {
        //     return { result: value };
        // },

        // instrumentCodePre: function (iid, code, isDirect) {
        //     return { code: code, skip: false };
        // },

        // instrumentCode: function (iid, newCode, newAst, isDirect) {
        //     return { result: newCode };
        // },

        // endExpression: function (iid) {
        // },

        // endExecution: function () {
        // },

        // runInstrumentedFunctionBody: function (iid, f, functionIid, functionSid) {
        //     return false;
        // },

        // onReady: function (cb) {
        //     cb();
        // },
    };
}());
