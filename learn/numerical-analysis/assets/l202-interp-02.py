from scipy.interpolate import lagrange
import numpy as np

t = [-2, 0, 1]
y = [-27, -1, 0]

# SciPy has a built-in lagrange method
poly = lagrange(t, y)

print("Lagrange Polynomial coefficients:")
print(poly)
# Expected: -4t^2 + 5t - 1
