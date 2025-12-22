import numpy as np
import matplotlib.pyplot as plt
    
def f(x):
    return x
    
x = np.random.rand(100000)
data = f(x)

plt.hist(data, bins=50, range=(0.,1.), color='y')
plt.show()