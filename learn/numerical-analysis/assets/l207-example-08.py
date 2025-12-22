import numpy as np
import matplotlib.pyplot as plt

plt.figure(figsize=(10,5), dpi=80)
    
r1 = np.random.rand(10000)
r2 = np.random.rand(10000)
x = (-2.*np.log(r1))**0.5*np.cos(2.*np.pi*r2)
y = (-2.*np.log(r1))**0.5*np.sin(2.*np.pi*r2)

plt.subplot(1,2,1)
plt.hist(x, bins=50, range=(-5.,+5.), color='y')

plt.subplot(1,2,2)
plt.hist(y, bins=50, range=(-5.,+5.), color='c')

plt.show()