export function twice(x) {
  return x * 2;
}

export class Box {
  constructor(value) {
    this.value = value;
  }
}

export const answer = twice(21);

print(new Box(answer).value);
