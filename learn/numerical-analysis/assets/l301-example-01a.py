import numpy as np
import matplotlib.pyplot as plt

mnist = np.load('mnist.npz')
x_train = mnist['x_train']
y_train = mnist['y_train']

fig = plt.figure(figsize=(6,6), dpi=80)
plt.imshow(x_train[0], cmap='Greys')
plt.show()

