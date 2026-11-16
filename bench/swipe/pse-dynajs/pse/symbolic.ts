// use the jshashtable
// declare var Hashtable: any;
// /// <amd-dependency path="hashtable.js" />
// declare var require:(moduleId:string) => any;
// var Hashtable = require("hashtable.js");

namespace TSJ$.PSE {

    var StrMatchGlobalStack:Util.SafeStack< Array<string> > = new Util.SafeStack;

    export function StrMatchGlobalStackPop() : Array<string> | null {
        if (StrMatchGlobalStack.length() === 0)
            return null;
        else
            return StrMatchGlobalStack.pop();
    }
    export function StrMatchGlobalStackPush( a: Array<string> ) {
        StrMatchGlobalStack.push(a);
    }

    var ObjRefList: object[] = [];
    /* TODO: linear searching array is not v. efficient
     * but hashing object is a little tricky ... */
    var ShadowObjList : {[key: string]: Symbolic<anything>}[] = [];
    export function IsSymbolicField(n : object, pname : string) : boolean {
        let ind = ObjRefList.indexOf(n);
        if (ind === -1)
            return false;
        else {
            let d = ShadowObjList[ind];
            if (d[pname] === undefined)
                return false;
            else
                return true;
        }
    }
    export function GetSymbolicField(n : object, pname : string) : Symbolic<anything> {
        let ind = ObjRefList.indexOf(n);
        let d = ShadowObjList[ind];
        return d[pname];
    }
    export function WriteSymbolicField(n : object, pname : string, val : Symbolic<anything>) {
        let ind = ObjRefList.indexOf(n);
        if (ind === -1) { // n is a new object
            ind = ObjRefList.push(n) - 1;
            ShadowObjList.push({});
        }
        let d = ShadowObjList[ind];
        d[pname] = val;
        ShadowObjList[ind] = d;
    }

    var IntermediateSymVars: string[] = [];
    export function GetIntermediateSymVar() : string {
        let s : string = "sv" + IntermediateSymVars.length;
        Clean.Array_push(IntermediateSymVars, s);
        // IntermediateSymVars.push(s);
        return s;
    }
    export function HasIntermediateSymVars() : boolean {
        return IntermediateSymVars.length > 0;
    }

    export type Concretizer = <U>(x:Symbolic<U>)=>U;
    export type ValueOfHandler = <U>(x:Symbolic<U>)=>anything;

    export class SymbolicVariable {
        constructor(
            public readonly base:anything,
            public readonly attr:string,
            public saved_value:anything,
            public readonly symvar:PSE.InputSymbol<anything>
        ) {}

        get_base() : anything {
            return this.base;
        }

        get_attr() : string {
            return this.attr;
        }

        get_saved_value() : anything {
            return this.saved_value;
        }

        get_input_symbol() : PSE.InputSymbol<anything> {
            return this.symvar;
        }

        set_saved_value(value : anything) : void {
            this.saved_value = value;
        }
    }

    export abstract class Symbolic<T> {
        constructor(
            public readonly type:Type<T>,
            private readonly valueOfHandler:ValueOfHandler,
        ) {}

        //TODO: ideally we probably wouldn't have this as a member on Symbolic (rather we would have a registry of concretization functions and we would look up the type of symbol we were concretizing there)
        abstract concretize(c:Concretizer):T;

        //TODO: ideally we wouldn't have this as a member on Symbolic (rather we would have a registry of smt stringifiers)
        abstract asSMT(c:SMT.FormatterContext):SMT.S;

        isType<U>(type:Type<U>): this is Symbolic<U> {
            // this use of any is okay
            return this.type as Type<any> === type;
        }

        // using x instanceof Symbolic will type guard it to Symbolic<any>, but we want Symbolic<anything>
        static instanceOf(x:anything):x is Symbolic<anything> {
            return x instanceof Symbolic;
        }

        // These "ValueOfHandler" acrobatics are to account for the fact that
        // there are a number of implicit string converstions that may happen to
        // objects. Ideally, we would identify them all and handle them before it
        // gets to the coercions, but that's not practical now. For example:
        // "anchor.href = thing" converts thing to a string, and if thing is a
        // symbol or an object containing symbols, would be in trouble if we didn't
        // handle this.

        valueOf():anything {
            return this.valueOfHandler(this);
        }

        toString():string {
            return String(this.valueOf());
        }
    }
}