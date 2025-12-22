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

roc3_y = np.array([(out1>th).sum()/len(out1) for th in np.linspace(-0.1,0.1,1000)])
roc3_x = np.array([(out0>th).sum()/len(out0) for th in np.linspace(-0.1,0.1,1000)])
avg = (roc3_y+(1.-roc3_x))/2

print(1.-avg.max())


roc1_y = np.array([(var1[0]<th).sum()/len(var1[0]) for th in np.linspace(0.0,0.4,200)])
roc1_x = np.array([(var0[0]<th).sum()/len(var0[0]) for th in np.linspace(0.0,0.4,200)])

roc2_y = np.array([(var1[1]>th).sum()/len(var1[1]) for th in np.linspace(-0.01,1.,200)])
roc2_x = np.array([(var0[1]>th).sum()/len(var0[1]) for th in np.linspace(-0.01,1.,200)])

roc3_y = np.array([(out1>th).sum()/len(out1) for th in np.linspace(-0.3,0.1,200)])
roc3_x = np.array([(out0>th).sum()/len(out0) for th in np.linspace(-0.3,0.1,200)])

fig = plt.figure(figsize=(6,6), dpi=80)
plt.plot(roc1_x, roc1_y, lw=3)
plt.plot(roc2_x, roc2_y, lw=3)
plt.plot(roc3_x, roc3_y, lw=3)
plt.plot([0,1],[0,1], ls='--', c='gray')
plt.grid()
plt.show()