import numpy as np
import matplotlib.pyplot as plt
from scipy.interpolate import lagrange

def f(x):
    return 1 / (1 + 25 * x**2)

# Equispaced nodes cause oscillation
x_nodes = np.linspace(-1, 1, 11) # 11 points = degree 10
y_nodes = f(x_nodes)

poly = lagrange(x_nodes, y_nodes)

x_plot = np.linspace(-1, 1, 200)
plt.figure(figsize=(8, 5))
plt.plot(x_plot, f(x_plot), 'k-', label='True Function')
plt.plot(x_plot, poly(x_plot), 'r--', label='Polynomial (Deg 10)')
plt.plot(x_nodes, y_nodes, 'bo', label='Nodes')

plt.ylim(-0.2, 1.2)
plt.title("Runge's Phenomenon: Wiggle at the edges")
plt.legend()
plt.grid(True, alpha=0.3)
plt.show()
