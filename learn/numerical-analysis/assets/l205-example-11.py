import numpy as np
import matplotlib.pyplot as plt

np.random.seed(123456)
sig = np.random.randn(1000,2)*0.5
bkg = np.vstack([np.random.randn(1000,2)*[0.4,0.6]+[+1.,+1.],
                 np.random.randn(1000,2)*[0.7,0.3]+[-1.,-1.]])

plt.figure(figsize=(6, 6), dpi=80)
plt.scatter(sig[:,0],sig[:,1],c='red',alpha=0.5,s=10,marker='o')
plt.scatter(bkg[:,0],bkg[:,1],c='black',alpha=0.5,s=10,marker='o')
plt.show()
