// jest.tsx

// ✅ Function
export function multiply(a: number, b: number): number {
  return a * b;
}

// ✅ Test (Jest)
describe('multiply', () => {
  it('returns product of two positive numbers', () => {
    expect(multiply(3, 4)).toBe(12);
  });

  it('returns 0 if one number is 0', () => {
    expect(multiply(5, 0)).toBe(0);
  });

  it('works with negative numbers', () => {
    expect(multiply(-2, 3)).toBe(-6);
    expect(multiply(-3, -3)).toBe(9);
  });

  it('handles decimals', () => {
    expect(multiply(2.5, 2)).toBe(5);
  });
});
