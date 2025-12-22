import numpy as np
import matplotlib.pyplot as plt

mnist = np.load('mnist.npz')
x_train = mnist['x_train']
y_train = mnist['y_train']

sample0 = x_train[y_train==0]/255.
sample1 = x_train[y_train==1]/255.

all_mean0 = sample0.mean(axis=(1,2))
all_mean1 = sample1.mean(axis=(1,2))

center_mean0 = sample0[:,10:18,11:17].mean(axis=(1,2))
center_mean1 = sample1[:,10:18,11:17].mean(axis=(1,2))

fig = plt.figure(figsize=(6,6), dpi=80)
plt.scatter(all_mean0, center_mean0, c = 'y', s=5, alpha=0.5)
plt.scatter(all_mean1, center_mean1, c = 'g', s=5, alpha=0.5)
plt.show()