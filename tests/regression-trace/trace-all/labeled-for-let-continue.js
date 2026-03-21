let count = 0;

loopB:
for (let i = 0; i < 2; i++) {
  count += 1;
  continue loopB;
}
