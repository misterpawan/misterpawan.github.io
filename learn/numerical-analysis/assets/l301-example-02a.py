import numpy as np
import matplotlib.pyplot as plt

mnist = np.load('mnist.npz')
x_train = mnist['x_train']
y_train = mnist['y_train']

sample0 = x_train[y_train==0]/255.
sample1 = x_train[y_train==1]/255.

all_mean0 = sample0.mean(axis=(1,2))
all_mean1 = sample1.mean(axis=(1,2))

thresholds = np.linspace(0.0,0.4,200)

roc_y = np.array([(all_mean1<th).sum()/len(all_mean1) for th in thresholds])
roc_x = np.array([(all_mean0<th).sum()/len(all_mean0) for th in thresholds])

fig = plt.figure(figsize=(6,6), dpi=80)
plt.plot(roc_x, roc_y, lw=3)
plt.plot([0,1],[0,1], ls='--', c='gray')
plt.grid()
plt.show()