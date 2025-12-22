import numpy as np
import matplotlib.pyplot as plt
    
r = np.random.rand(10000)
data = -np.log(1.-r+r/np.exp(1.))

plt.hist(data, bins=50, range=(0.,1.), color='y')
plt.show()