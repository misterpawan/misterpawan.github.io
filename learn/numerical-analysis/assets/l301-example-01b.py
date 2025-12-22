import numpy as np
import matplotlib.pyplot as plt

mnist = np.load('mnist.npz')
x_train = mnist['x_train']
y_train = mnist['y_train']
zero_and_one = x_train[y_train<=1]

fig = plt.figure(figsize=(6,9), dpi=80)
for i in range(6):
    plt.subplot(3,2,i+1)
    plt.imshow(zero_and_one[i], cmap='Greys')
plt.show()