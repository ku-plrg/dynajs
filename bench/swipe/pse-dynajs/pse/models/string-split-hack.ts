namespace TSJ$.PSE.Models {
    export const String_split_HACK:PartialModeler = (call,context) => {
        // TODO: we're dropping taint information here because of the large smt expressions produced. maybe don't?
        if(
            call instanceof Hook.FunctionCall &&
            call.f === Saved.String_split &&
            isLikeString(call.base) &&
            Symbolic.instanceOf(call.base) &&
            call.args.length == 1
        ) {
            //REMOVELOG console.log("split!!")
            //REMOVELOG console.log(call.base)
            const base = context.encoder.asSymbolicString(call.base);
            const split = call.args[0];
            if(
                typeof split == "string"
            ) {
                //REMOVELOG console.log('[+] string-split-hack: symbolic');
                return ValueChoosingEffect.from((chooser) => {
                    const id:string = randomString();
                    const REALstring = chooser(base,"",true)
                    const REALsplit = REALstring.split(split);

                    let smts:string[] = [];

                    for(let i = 0; i < REALsplit.length; i ++) {
                        Clean.Array_push(smts,"(declare-const " + idI(id,i) + " String)")
                        Clean.Array_push(smts,"(assert (= (str.indexof " + idI(id,i) + " " + Util.basicStringEscape(split) + " 0) (- 1)))");
                    }

                    let concatArr:string[] = ["str.++","\"\"",idI(id,0)];
                    for(let i = 1; i < REALsplit.length; i ++) {
                        Clean.Array_push(concatArr,Util.basicStringEscape(split));
                        Clean.Array_push(concatArr,idI(id,i));
                    }

                    let concat:SMT.S = Clean.apply(SMT.s,null,concatArr);
                    let constraint = SMT.s("=",concat,base.asSMT(new SMT.FormatterContext));
                    Clean.Array_push(smts,"(assert " + constraint + ")");

                    let oppositeConstraint = SMT.s("not",
                        SMT.s("=",
                            SMT.s("str_split_len",
                                base.asSMT(new SMT.FormatterContext),
                                Util.basicStringEscape(split)
                            ),
                            String(REALsplit.length)
                        )
                    );
                    REGISTER_OOB(Clean.Array_join(smts,"\n"),oppositeConstraint);
                    if (Config.split_heuristic) {
                        REGISTER_SYMBOLIC(id+"S"+"0"); // Record split return arrays.
                    }
                    // we need a reversible effect (rather than just a
                    // return effect) because we're returning a mutable object
                    return ReversibleEffect.from(() => {
                        let ret = [];
                        for(let i = 0; i < REALsplit.length; i ++) {
                            ret[i] = new Symbols.StringSplitIndexingHACK(
                                REALsplit[i],
                                id+"S"+String(i),
                                context.encoder.valueOfHandler,
                            )
                        }
    
                        return {next: new ReturnEffect(ret)};
                    });
                });
            }
        }
        return;
    }
    function idI(id:string,i:number) {
        return id+"S"+String(i);
    }
    const idMap:Util.SafeMap<object,string> = new Util.SafeMap;
    function idFor(o:object):string {
        if(!idMap.has(o)) {
            idMap.set(o,randomString());
        }
        return idMap.get(o);
    }
    function randomString():string {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      
        for (var i = 0; i < 5; i++)
          text += possible.charAt(Math.floor(Math.random() * possible.length));
      
        return text;
    }
}
