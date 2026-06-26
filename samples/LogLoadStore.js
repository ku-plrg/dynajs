/**
 * LogLoadStore — logs every variable read/write and field get/put, indented
 * by call depth.
 *
 * Note: DynaJS does not expose shadow memory, so object identity is omitted.
 * Field accesses are logged as "base.prop" and variable accesses as their name.
 */

(function (D$) {
  var indentation = 0;

  function indent() {
    return '    '.repeat(indentation);
  }

  /** @param {string} str */
  function log(str) {
    console.log(indent() + str);
  }

  D$.analysis = {
    invokeFunPre: function (id, f, base, args, isConstructor, isMethod) {
      indentation++;
    },

    invokeFun: function (id, f, base, args, result, isConstructor, isMethod) {
      indentation--;
    },

    getField: function (id, base, prop, value) {
      log('Load .' + prop + ' @ ' + D$.idToLoc(id));
    },

    putField: function (id, base, prop, value) {
      log('Store .' + prop + ' = ' + value + ' @ ' + D$.idToLoc(id));
    },

    read: function (id, name, value) {
      log('Load ' + name + ' @ ' + D$.idToLoc(id));
    },

    write: function (id, names, value) {
      log('Store ' + names.join(', ') + ' = ' + value + ' @ ' + D$.idToLoc(id));
    },
  };
})(D$);
