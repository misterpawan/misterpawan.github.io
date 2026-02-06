
import type { FunctionDict } from '../types';

export const FUNCTIONS: FunctionDict = {
  quadratic: {
    label: 'f(x) = 0.5 * x²',
    func: (x) => 0.5 * x * x,
    derivative: (x) => x,
    invDerivative: (y) => y,
    conjugate: (y) => 0.5 * y * y,
    domain: [-5, 5],
    range: [-1, 12.5],
    conjugateDomain: [-5, 5],
    conjugateRange: [-1, 12.5],
    description: 'The convex conjugate of a quadratic function is another quadratic function. This demonstrates a self-dual property under the Legendre-Fenchel transformation.',
  },
  abs: {
    label: 'f(x) = |x|',
    func: (x) => Math.abs(x),
    derivative: (x) => Math.sign(x),
    invDerivative: (y) => {
      if (y >= 1) return 1e6;
      if (y <= -1) return -1e6;
      return 0;
    },
    conjugate: (y) => {
      if (Math.abs(y) <= 1) {
        return 0;
      }
      return Infinity;
    },
    domain: [-5, 5],
    range: [-1, 5],
    conjugateDomain: [-2, 2],
    conjugateRange: [-1, 2],
    description: 'The conjugate of the absolute value function is an indicator function. It is zero for slopes in [-1, 1] and infinite elsewhere, showing how constraints on slopes are formed.',
  },
  exp: {
    label: 'f(x) = exp(x)',
    func: (x) => Math.exp(x),
    derivative: (x) => Math.exp(x),
    invDerivative: (y) => {
        if (y <= 0) return -Infinity;
        return Math.log(y);
    },
    conjugate: (y) => {
      if (y < 0) return Infinity;
      if (y === 0) return 0;
      return y * Math.log(y) - y;
    },
    domain: [-4, 3],
    range: [-1, 20],
    conjugateDomain: [-1, 10],
    conjugateRange: [-2, 15],
    description: 'The conjugate of the exponential function is the negative entropy function, `y log(y) - y`. This pair is fundamental in optimization and information theory.',
  },
   neg_entropy: {
    label: 'f(x) = x log(x) - x (for x>0)',
    func: (x) => x > 0 ? x * Math.log(x) - x : Infinity,
    derivative: (x) => x > 0 ? Math.log(x) : -Infinity,
    invDerivative: (y) => Math.exp(y),
    conjugate: (y) => Math.exp(y),
    domain: [0, 5],
    range: [-2, 7],
    conjugateDomain: [-4, 3],
    conjugateRange: [-1, 20],
    description: 'The conjugate of the negative entropy function is the exponential function, demonstrating the perfect dual relationship with exp(x).',
  },
};
