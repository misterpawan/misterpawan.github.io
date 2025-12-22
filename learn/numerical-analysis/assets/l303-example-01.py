import numpy as np
import matplotlib.pyplot as plt

mnist = np.load('mnist.npz')
x_train = mnist['x_train']/255.
y_train = np.array([np.eye(10)[n] for n in mnist['y_train']])
x_test = mnist['x_test']/255.
y_test = np.array([np.eye(10)[n] for n in mnist['y_test']])

from keras.models import Sequential
from keras.layers import Dense, Reshape
from keras.optimizers import SGD

model = Sequential()
model.add(Reshape((784,), input_shape=(28,28)))
model.add(Dense(units=30, activation='sigmoid'))
model.add(Dense(units=10, activation='sigmoid'))

model.compile(loss='mean_squared_error',
              optimizer=SGD(lr=3.0),
              metrics=['accuracy'])

model.fit(x_train, y_train, epochs=20, batch_size=10)

print('Performance (training)')
print('Loss: %.5f, Acc: %.5f' % tuple(model.evaluate(x_train, y_train)))
print('Performance (testing)')
print('Loss: %.5f, Acc: %.5f' % tuple(model.evaluate(x_test, y_test)))