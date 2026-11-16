/// <reference path="./clean.ts" />

namespace TSJ$ {
    class ReTranslator {
        private static baseURL = "http://localhost:9222/";

        constructor() {
            
        }

        translateViaAjax(msg:string):string {
            let ajax = new Util.SafeAJAX;

            /* assuming msg has the slashes denoting it as a RegExp */
            /* that is, the string you get with String(RegExp) */

            ajax.open("post", ReTranslator.baseURL, false);
            ajax.send(msg+"\n\n");

            return ajax.responseText();

        }

    }
    export const reTranslator = new ReTranslator();
}