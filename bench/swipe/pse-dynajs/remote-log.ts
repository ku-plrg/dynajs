/// <reference path="./clean.ts" />

namespace TSJ$ {
    class RemoteLogger {
        private static baseURL = "https://localhost:8307/";

        postJSON(jsonStr: string) {
            const xhr = new Saved.XMLHttpRequest();
            xhr.open("POST", RemoteLogger.baseURL);
            xhr.setRequestHeader("Accept", "application/json");
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    console.log(xhr.responseText);
                }
            };
            xhr.send(jsonStr);
        }

        sendUntimedMessage(type:string, message:anything, sequence:number) {
            try {
                let str = JSON.stringify({
                    type: 'constraint',
                    body: {
                        type: type,
                        // sequence: sequence,
                        message: message
                    },
                });
                this.postJSON(str);
            } catch(e) {
                Saved.console_error("Encountered error when stringifying", message);
            }
        }

        sendMessage(type:string,message:anything) {
            try {
                let str = JSON.stringify({
                    type: 'constraint',
                    body: {
                        type: type,
                        message: message,
                        time: new Date().toISOString(),
                    },
                });
                this.postJSON(str);
            } catch(e) {
                Saved.console_error("Encountered error when stringifying",message);
            }
        }

        private print(level:string,things:unsafe) {
            this.sendMessage("print",{
                level: level,
                things: things,
            });
        }

        printLog(...things:unsafe[]) {
            this.print("log",things);
        };

        printWarn(...things:unsafe[]) {
            this.print("warn",things);
        };

        printError(...things:unsafe[]) {
            this.print("error",things);
        };
    }

    export const remoteLogger = new RemoteLogger();
}