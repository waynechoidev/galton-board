export const generateRandomProbabilities = (n: number): Float32Array => {
  const probabilities = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    probabilities[i] = Math.random() < 0.5 ? -1 : 1;
    // probabilities[i] = getRandomFloat(0.5, 1.0);
  }
  return probabilities;
};

export const sumUpToN = (n: number): number => (n * (n + 1)) / 2;
