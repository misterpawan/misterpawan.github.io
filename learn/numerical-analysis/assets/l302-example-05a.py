import numpy as np
import matplotlib.pyplot as plt

mnist = np.load('mnist.npz')
x_train = mnist['x_train'][:10000]/255.
y_train = np.array([np.eye(10)[n] for n in mnist['y_train'][:10000]])
x_test = mnist['x_test']/255.
y_test = np.array([np.eye(10)[n] for n in mnist['y_test']])

scores = np.zeros((4,100))

from neurons import neurons
model = neurons([784,30,10])
for ep in range(100):
    model.fit(x_train, y_train, 1, 10, 3.0)
    scores[0][ep],scores[1][ep] = model.evaluate(x_train, y_train)
    scores[2][ep],scores[3][ep] = model.evaluate(x_test, y_test)

vep = np.linspace(1.,100.,100)
fig = plt.figure(figsize=(6,6), dpi=80)
plt.subplot(2,1,1)
plt.plot(vep,scores[0], lw=3)
plt.plot(vep,scores[2], lw=3)
plt.subplot(2,1,2)
plt.plot(vep,scores[1], lw=3)
plt.plot(vep,scores[3], lw=3)
plt.show()