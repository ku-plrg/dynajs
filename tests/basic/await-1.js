async function lit() {
  return 42;
}

async function asyncFunc() {
  let x = await lit();
  return x;
}

asyncFunc();
