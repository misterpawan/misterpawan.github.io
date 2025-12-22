import numpy as np
import matplotlib.pyplot as plt

plt.figure(figsize=(6,6), dpi=80)
    
r = np.random.rand(10000)
r += np.random.rand(10000)
r += np.random.rand(10000)
r += np.random.rand(10000)
r += np.random.rand(10000)
r += np.random.rand(10000)

plt.hist(r, bins=50, range=(0.,+6.), color='y')
plt.show()