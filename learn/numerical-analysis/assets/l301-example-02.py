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

fig = plt.figure(figsize=(12,5), dpi=80)

plt.subplot(1,2,1)
plt.hist(all_mean0, bins=50, color='y')
plt.hist(all_mean1, bins=50, color='g', alpha=0.5)

plt.subplot(1,2,2)
plt.hist(center_mean0, bins=50, color='y')
plt.hist(center_mean1, bins=50, color='g', alpha=0.5)

plt.show()