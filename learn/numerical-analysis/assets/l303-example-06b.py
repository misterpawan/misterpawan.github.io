import numpy as np
import matplotlib.pyplot as plt

mnist = np.load('mnist.npz')
x_train = mnist['x_train'][:10000]/255.
y_train = np.array([np.eye(10)[n] for n in mnist['y_train'][:10000]])

from keras.models import Sequential, clone_model
from keras.layers import Dense, Reshape
from keras.optimizers import SGD

m1 = Sequential()
m1.add(Reshape((784,), input_shape=(28,28)))
m1.add(Dense(30, activation='sigmoid'))
m1.add(Dense(10, activation='softmax'))
m1.compile(loss='categorical_crossentropy',
           optimizer=SGD(lr=2.0))

m2 = clone_model(m1)
m2.compile(loss='categorical_crossentropy',
           optimizer=SGD(lr=2.0))

m3 = clone_model(m1)
m3.compile(loss='categorical_crossentropy',
           optimizer=SGD(lr=2.0))

rec1 = m1.fit(x_train, y_train, epochs=100, batch_size=10)
rec2 = m2.fit(x_train, y_train, epochs=100, batch_size=30)
rec3 = m3.fit(x_train, y_train, epochs=100, batch_size=300)

vep = np.linspace(1.,100.,100)
fig = plt.figure(figsize=(6,6), dpi=80)
plt.plot(vep,rec1.history['loss'], lw=3)
plt.plot(vep,rec2.history['loss'], lw=3)
plt.plot(vep,rec3.history['loss'], lw=3)
plt.ylim(-0.05,0.5)
plt.grid()
plt.show()