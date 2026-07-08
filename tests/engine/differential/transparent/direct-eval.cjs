function run(code) {
  function Y() {
    return "ok";
  }

  return eval(code);
}

console.log(run("Y()"));
