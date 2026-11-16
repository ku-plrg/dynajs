namespace TSJ$ {
    /*
    * This integer business is a bit of a hack. We're abusing the type
    * system to carry information about a number, namely whther or not it has
    * an integral value. It's impossible for something to properly have type
    * integer, as it would have to be both a number and an _integer,
    * which is contradictory since something can't be both an object and a number.
    * But it's fine, as we can just assert that something is using the type guard
    * in integer.is().
    */
    // maybe rather than the dummy class _integer we could use void or never, but this seems to work
    class _integer {
        private constructor(
            // the type checker ignores the type if it has no field, so we have _unused
            public readonly _unused:unsafe
        ) {}
    }
    export type integer = (number & _integer)
                        | 0 | 1 | 2 | 3 | 4
                        |-1 |-2 |-3 |-4;
    // feel free to add more literals. they're here so we don't have to
    // do stupid things like integer.cast(0)

    export namespace integer {
        export function add(a:integer,b:integer):integer {
            return cast(a + b);
        }

        export function subtract(a:integer,b:integer):integer {
            return cast(a - b);
        }

        export function cast(x:number):integer {
            if(!is(x)) {
                throw Util.throwInternalError("cast failed:",x,"is not an integer");
            }
            return x;
        }

        export function is(n:anything):n is integer {
            if(typeof n != "number") {
                return false;
            }
            
            if(Saved.isNaN(n))
                return false;
            
            // 2^53 = 9007199254740992 is the max integer expressible in JavaScript
            // TODO: change these bounds to the maximum and minimum expressible ints
            if(n > 2147483647)
                return false;
            if(n < -2147483647)
                return false;
            
            if(n%1 !== 0)
                return false;
            
            return true;
        }
    }
}