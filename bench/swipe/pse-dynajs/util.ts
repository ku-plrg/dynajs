namespace TSJ$.Util {
    export function basicStringEscape(x:string) {
        // replaces " with \x22
        return (
            '"' +
            Clean.String_replace(
                x,
                /"/g,
                '\\x22'
            ) +
            '"'
        );
    }

    export function basicDebugToString(x:anything) {
        if(typeof x == "string") {
            return basicStringEscape(x);
        } 
        else if(x instanceof RegExp) {
            return "<regex>"+String(x)+"</regex>";
        }
        else if(x instanceof Function) {
            //TODO: why doesn't typeof x == "function" work above?
            //TODO: search for the name in String.prototype, etc, to distingush String.prototype.toString from Object.prototype.toString
            return String(x.name);
        } 
        else if (TSJ$.PSE.Symbolic.instanceOf(x)) {
            return x.asSMT(new TSJ$.PSE.SMT.FormatterContext());
        }
        else if(typeof x == "object") {
            try {
                return String(x);
            } catch(e) {
                return "[UNSTRINGIFYABLE " + Clean.Object_toString(x) + "]";
            }
        } 
        else {
            return String(x);
        }
    }

    // some objects (*cough* *cough* Symbolic objects *cough* *cough*) have to
    // override toString to have side-effects, so they provide toStringSafe()
    // which provides their "real" toString(). This will check for the presence
    // of toStringSafe() and use it instead, and so this should be used everywhere
    // possible in lieu of String(x) or x.toString().
    /*
    export function safeToString(x:(object|null)):string {
        if(x === null) {
            return String(x);
        }

        if(Unsafe.getField(x,"toStringSafe")) {
            //TODO: check whether its a string rather than blindly casting
            return String(Unsafe.callMethod(x,"toStringSafe"));
        } else {
            try {
                return String(x);
            } catch(e) {
                return "[UNSTRINGIFYABLE " + Clean.Object_toString(x) + "]";
            }
        }
    }
    */

    export class SafeStack<T> {
        private _inner:T[] = [];

        length():number {
            return this._inner.length;
        }

        push(thing:T):number {
            return Clean.Array_push(this._inner,thing);
        }

        pop():T {
            return Clean.Array_pop(this._inner);
        }

        peek():T {
            if(this._inner.length == 0) {
                throw Util.throwInternalError("Can't peek at empty array.");
            }
            return this._inner[this._inner.length-1];
        }
    }
    export class SafeAJAX {
        private _ajax:XMLHttpRequest = new Saved.XMLHttpRequest();

        open(
            method:string,
            url:string,
            async?:boolean,
            user?:string,
            password?:string
        ):void {
            Clean.XMLHttpRequest_open(this._ajax,method,url,async,user,password);
        }

        send(
            body:string,
        ):void {
            Clean.XMLHttpRequest_send(this._ajax,body);
        }

        status():number {
            return this._ajax.status;
        }

        responseText():string {
            return this._ajax.responseText;
        }
    }

    export class SafeMap<K,V> {
        private _inner:Map<K,V> = new Saved.Map();

        set(key:K,value:V) {
            return Clean.Map_set(this._inner,key,value);
        }

        get(key:K):V {
            return Clean.Map_get(this._inner,key);
        }

        has(key:K):boolean {
            return Clean.Map_has(this._inner,key);
        }

        size():number {
            return this._inner.size;
        }
    }

    export class SafeSet<T> {
        private _inner:Map<T,boolean> = new Saved.Map();

        add(key:T) {
            return Clean.Map_set(this._inner,key,true);
        }

        remove(key:T):void {
            return Clean.Map_delete(this._inner,key);
        }

        has(key:T):boolean {
            return Clean.Map_has(this._inner,key) === true;
        }

        size():number {
            return this._inner.size;
        }

        clear() {
            return Clean.Map_clear(this._inner);
        }
    }

    let _terminated:boolean = false;

    export function throwInternalError(...args:anything[]):never {
        // _terminated = true;
        // remoteLogger.sendMessage("internal_error",args);
        // Saved.console_error("Internal error:");
        // Clean.apply(Saved.console_error,null,args);
        // throw new Error("Internal error");
        setTimeout(() => {
            throw Error("Invariant violation: " + (args[0] as String));
        });
        throw new Error("Invariant violation: " + (args[0] as String));
    }

    export function terminated() {
        return _terminated;
    }

    let debugHangLastTime = 0; // assumes we're after 1970
    const debugHangInterval = 1000;
    export function debugHang(...args:anything[]) {
        const time = Date.now();
        if(time - debugHangLastTime > debugHangInterval) {
            debugHangLastTime = time;
            let a0:anything[] = ["DEBUG HANG:"];
            console.error(a0.concat(args));
        }
    }
}
