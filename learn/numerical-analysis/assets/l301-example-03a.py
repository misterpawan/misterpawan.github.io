import numpy as np
import scipy.linalg as linalg
import matplotlib.pyplot as plt

mnist = np.load('mnist.npz')
x_train = mnist['x_train']
y_train = mnist['y_train']

sample0 = x_train[y_train==0]/255.
sample1 = x_train[y_train==1]/255.

var0 = np.vstack([sample0.mean(axis=(1,2)),sample0[:,10:18,11:17].mean(axis=(1,2))])
var1 = np.vstack([sample1.mean(axis=(1,2)),sample1[:,10:18,11:17].mean(axis=(1,2))])

mu0 = var0.mean(axis=1)
mu1 = var1.mean(axis=1)
cov0 = np.cov(var0)
cov1 = np.cov(var1)

weight = np.dot(linalg.inv(cov1+cov0),mu1-mu0)
norm = np.sqrt((weight**2).sum())
weight /= norm

out0 = (var0.T*weight).sum(axis=1)
out1 = (var1.T*weight).sum(axis=1)

fig = plt.figure(figsize=(6,6), dpi=80)
plt.hist(out0, bins=50, color='y')
plt.hist(out1, bins=50, color='g', alpha=0.5)
plt.show()