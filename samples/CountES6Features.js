(function (D$) {

  // Dynamic limitation:
  // - Counts executed ES6+ feature sites, not all syntax in dead code.
  // - Site identity is based on D$.idToLoc(id), so it is best suited for
  //   single-target runs such as `dynajs node target.js`.

  var featureHits = Object.create(null);
  var featureExecs = Object.create(null);
  var functionKindHits = Object.create(null);

  /** @param {string} feature */
  function ensureFeature(feature) {
    if (!featureHits[feature]) featureHits[feature] = new Set();
    if (!featureExecs[feature]) featureExecs[feature] = 0;
  }

  /** @param {number} id */
  function safeLoc(id) {
    try {
      return D$.idToLoc(id);
    } catch (_err) {
      return String(id);
    }
  }

  /** @param {string} feature @param {number} id */
  function record(feature, id) {
    ensureFeature(feature);
    featureHits[feature].add(safeLoc(id));
    featureExecs[feature] += 1;
  }

  /** @param {string} feature @param {number} id */
  function recordFunctionKind(feature, id) {
    if (!functionKindHits[feature]) functionKindHits[feature] = new Set();
    functionKindHits[feature].add(safeLoc(id));
  }

  var flushed = false;

  function printSummary() {
    if (flushed) return;
    flushed = true;

    var mergedHits = Object.create(null);
    var mergedExecs = Object.create(null);
    var featureNames = Object.keys(featureHits);
    for (var f = 0; f < featureNames.length; f++) {
      var featureName = featureNames[f];
      mergedHits[featureName] = featureHits[featureName];
      mergedExecs[featureName] = featureExecs[featureName];
    }
    var functionNames = Object.keys(functionKindHits);
    for (var g = 0; g < functionNames.length; g++) {
      var functionName = functionNames[g];
      mergedHits[functionName] = functionKindHits[functionName];
      mergedExecs[functionName] = functionKindHits[functionName].size;
    }

    var names = Object.keys(mergedHits).sort(function (a, b) {
      var diff = mergedHits[b].size - mergedHits[a].size;
      return diff !== 0 ? diff : a.localeCompare(b);
    });

    console.log("Executed ES6+ feature sites:");
    if (names.length === 0) {
      console.log("  <none observed>");
      return;
    }

    var totalSites = 0;
    for (var i = 0; i < names.length; i++) {
      totalSites += mergedHits[names[i]].size;
    }
    console.log("  total: " + totalSites);

    for (var j = 0; j < names.length; j++) {
      var name = names[j];
      var sites = Array.from(mergedHits[name]).sort();
      console.log(
        "  " + name + ": " + sites.length + " site(s), " + mergedExecs[name] + " execution(s)"
      );
      console.log("    " + sites.join(", "));
    }
  }

  process.on("exit", printSummary);

  D$.analysis = {
    endExecution: function () {
      printSummary();
    },

    declare: function (id, name, kind, init, value, isSpread) {
      if (kind === "let") record("let declarations", id);
      if (kind === "const") record("const declarations", id);
      if (kind === "class") record("class declarations", id);
      if (isSpread) record("rest/spread bindings", id);
    },

    bigintLiteral: function (id, value) {
      record("bigint literals", id);
      return { result: value };
    },

    binary: function (id, op, left, right, result) {
      if (op === "**") record("exponentiation operator", id);
      return { result: result };
    },

    forInOfObject: function (id, value, isForIn) {
      if (!isForIn) record("for-of loops", id);
      return { result: value };
    },

    taggedTemplate: function (id, f, base, strings, values, result, isMethod) {
      record("tagged template literals", id);
      return { result: result };
    },

    nullishCoalescing: function (id, value) {
      record("nullish coalescing", id);
      return { result: value };
    },

    optionalChain: function (id, value) {
      record("optional chaining", id);
      return { result: value };
    },

    _yield: function (id, value, isDelegate) {
      record(isDelegate ? "yield* expressions" : "yield expressions", id);
      return { result: value };
    },

    _await: function (id, value) {
      record("await expressions", id);
      return { result: value };
    },

    fieldInit: function (id, obj, key, isStatic, value) {
      record(isStatic ? "class static fields" : "class instance fields", id);
      return { result: value };
    },

    functionEnter: function (id, f, base, args, isAsync, isGenerator) {
      if (isAsync) recordFunctionKind("async functions", id);
      if (isGenerator) recordFunctionKind("generator functions", id);
    },
  };
})(D$);
