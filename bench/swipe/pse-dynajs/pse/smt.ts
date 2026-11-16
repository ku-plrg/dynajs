namespace TSJ$.PSE.SMT {
    // this is an SMTLIB S-expression
    export type S = string;

    export function s(...args:S[]):S {
        return "(" + Clean.Array_join(args," ") + ")";
    }
    
    export class FormatterContext {
        public variables:Util.SafeMap<string,Type<unsafe>> = new Util.SafeMap;

        registerVariable<T>(name:string,type:Type<T>) {
            if(!this.variables.has(name)) {
                this.variables.set(name,type);
            } else {
                if(this.variables.get(name) !== type) {
                    throw Util.throwInternalError("While creating an SMT string, we tried to register the same variable with two different types!");
                }
            }
        }
    }

    const preamble:string[] = [
"(set-option :produce-models true)",
`
(define-fun-rec str.split.len.rec ((str String) (split String) (pos Int)) Int
  (if (= (- 1) (str.indexof str split pos))
      1
      (+ 1 (str.split.len.rec str split (+ 1 (str.indexof str split pos))))))
(define-fun-rec str.split.len ((str String) (split String)) Int
    (str.split.len.rec str split 0))
`,
`
(define-fun-rec str.split.index.rec ((str String) (split String) (pos Int) (rem Int)) String
  (if (= (- 1) (str.indexof str split pos))
      ""
      (if (= 0 rem)
        (str.substr str pos (- (str.indexof str split pos) pos))
        (str.split.index.rec str split (+ (str.len split) (str.indexof str split pos)) (- rem 1))
      )
  )
)
(define-fun-rec str.split.index ((str String) (split String) (i Int)) String
    (str.split.index.rec str split 0 i))
`
    ];
}