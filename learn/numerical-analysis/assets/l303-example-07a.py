import numpy as np
import matplotlib.pyplot as plt

mnist = np.load('mnist.npz')
x_train = mnist['x_train']/255.
y_train = np.array([np.eye(10)[n] for n in mnist['y_train']])
x_test = mnist['x_test']/255.
y_test = np.array([np.eye(10)[n] for n in mnist['y_test']])

from keras.models import Sequential
from keras.layers import Reshape, Dense, Dropout
from keras.optimizers import Adadelta

model = Sequential()
model.add(Reshape((28*28,), input_shape=(28,28)))
model.add(Dense(256, activation='relu'))
model.add(Dropout(0.2))
model.add(Dense(256, activation='relu'))
model.add(Dropout(0.2))
model.add(Dense(10, activation='softmax'))

model.compile(loss='categorical_crossentropy',
              optimizer=Adadelta(),
              metrics=['accuracy'])

rec = model.fit(x_train, y_train, epochs=40, batch_size=128,
                validation_data=(x_test, y_test))

vep = np.linspace(1.,40.,40)
fig = plt.figure(figsize=(6,6), dpi=80)
plt.plot(vep,rec.history['acc'], lw=3)
plt.plot(vep,rec.history['val_acc'], lw=3)
plt.ylim(0.96,1.0)
plt.grid()
plt.show()