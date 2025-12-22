import numpy as np
import matplotlib.pyplot as plt

mnist = np.load('mnist.npz')
x_train = mnist['x_train'][:10000]/255.
y_train = np.array([np.eye(10)[n] for n in mnist['y_train'][:10000]])
x_test = mnist['x_test']/255.
y_test = np.array([np.eye(10)[n] for n in mnist['y_test']])

from keras.models import Sequential
from keras.layers import Dense, Reshape
from keras.optimizers import SGD

model = Sequential()
model.add(Reshape((784,), input_shape=(28,28)))
model.add(Dense(30, activation='sigmoid'))
model.add(Dense(10, activation='softmax'))

model.compile(loss='categorical_crossentropy',
              optimizer=SGD(lr=1.0),
              metrics=['accuracy'])

rec = model.fit(x_train, y_train, epochs=100, batch_size=120,
                validation_data=(x_test, y_test))

vep = np.linspace(1.,100.,100)
fig = plt.figure(figsize=(6,6), dpi=80)
plt.subplot(2,1,1)
plt.plot(vep,rec.history['loss'], lw=3)
plt.plot(vep,rec.history['val_loss'], lw=3)
plt.ylim(0.,0.35)
plt.grid()
plt.subplot(2,1,2)
plt.plot(vep,rec.history['acc'], lw=3)
plt.plot(vep,rec.history['val_acc'], lw=3)
plt.ylim(0.85,1.01)
plt.grid()
plt.show()