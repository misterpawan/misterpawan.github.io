import numpy as np

mnist = np.load('mnist.npz')
x_train = mnist['x_train']
y_train = mnist['y_train']

print('x shape:', x_train.shape)
print('y shape:', y_train.shape)

print('1st sample in x:', x_train[0])
print('1st sample in y:', y_train[0])
