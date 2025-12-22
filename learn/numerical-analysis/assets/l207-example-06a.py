import numpy as np
import matplotlib.pyplot as plt
    
def f(x):
    return x - x**2 + x**3 - x**4 + np.sin(x*13.)/13.

f_max = f(np.random.rand(1000)).max()*1.1

x = np.random.rand(20000)
y = np.random.rand(20000)*f_max
data = x[y<f(x)]

plt.hist(data, bins=50, range=(0.,1.), color='y')
plt.show()