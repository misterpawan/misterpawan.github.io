import numpy as np
import matplotlib.pyplot as plt

y_train = np.random.randint(0,2,5000)
rho = np.abs(np.random.randn(5000)/4.+1.+y_train)
phi = np.random.rand(5000)*np.pi*2.
x_train = np.c_[rho*np.cos(phi),rho*np.sin(phi)]

fig = plt.figure(figsize=(6,6), dpi=80)
plt.scatter(x_train[:,0][y_train==0], x_train[:,1][y_train==0], c = 'y', s=5, alpha=0.8)
plt.scatter(x_train[:,0][y_train==1], x_train[:,1][y_train==1], c = 'g', s=5, alpha=0.8)
plt.show()