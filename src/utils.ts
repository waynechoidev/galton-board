export const generateRandomProbabilities = (n: number): Float32Array => {
  const probabilities = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    probabilities[i] = Math.random() < 0.5 ? -1 : 1;
  }
  return probabilities;
};
