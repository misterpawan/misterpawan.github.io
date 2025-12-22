import numpy as np
import scipy.linalg as la

# Data points: (-2, -27), (0, -1), (1, 0)
t = np.array([-2, 0, 1])
y = np.array([-27, -1, 0])

# Construct Vandermonde Matrix
# Columns are t^0, t^1, t^2 ...
A = np.vander(t, increasing=True)

print("Vandermonde Matrix A:")
print(A)

# Solve Ax = y
x = la.solve(A, y)
print("\nCoefficients x:", x)
print(f"Polynomial: {x[0]:.1f} + {x[1]:.1f}t + {x[2]:.1f}t^2")
