namespace TSJ$ {
    const windowCopy = window;
    const documentCopy = document;
    const MapCopy = Map;
    const XMLHttpRequestCopy = XMLHttpRequest;

    export namespace Saved {
        export const bind = Function.prototype.bind;
        export const call = Function.prototype.call;
        export const isNaN = Number.isNaN;

        export const window = windowCopy;
        export const window_location = window.location;
        
        // somehow in Firefox window.location.toString != Location.prototype.toString...
        export const window_location_toString = window.location.toString;

        export const document = documentCopy;
        export const document_write = document.write;
        export const document_writeln = document.writeln;

        export const console_error = console.error;

        export const String_includes = String.prototype.includes;
        export const String_charAt = String.prototype.charAt;
        export const String_charCodeAt = String.prototype.charCodeAt;
        export const String_codePointAt = String.prototype.codePointAt;
        export const String_startsWith = String.prototype.startsWith;
        export const String_Slice = String.prototype.slice;
        export const String_endsWith = String.prototype.endsWith;
        export const String_substr = String.prototype.substr;
        export const String_substring = String.prototype.substring;
        export const String_toLowerCase = String.prototype.toLowerCase;
        export const String_toUpperCase = String.prototype.toUpperCase;
        export const String_indexOf = String.prototype.indexOf;
        export const String_concat = String.prototype.concat;
        //TODO: if we make a deliberate mistake and make String_split be indexOf, the error checker should notice!
        export const String_split = String.prototype.split;
        export const String_search = String.prototype.search;
        export const String_match = String.prototype.match;

        export const Re_test = RegExp.prototype.test;
        export const Re_exec = RegExp.prototype.exec;

        export const Array_from = Array.from;
        export const Array_push = Array.prototype.push;

        export const Map = MapCopy;

        export const XMLHttpRequest = XMLHttpRequestCopy;
    }
}
