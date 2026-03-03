async function* gen() {
  yield 1;
  yield 2;
}

async function main() {
  for await (const x of gen()) {
    x;
  }
}

main();
