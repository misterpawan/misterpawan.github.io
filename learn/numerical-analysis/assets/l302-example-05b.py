import numpy as np
import matplotlib.pyplot as plt
import copy

mnist = np.load('mnist.npz')
x_train = mnist['x_train'][:10000]/255.
y_train = np.array([np.eye(10)[n] for n in mnist['y_train'][:10000]])

scores = np.zeros((2,50))

from neurons import neurons
m1 = neurons([784,30,10])
m2 = copy.deepcopy(m1)
for w in m2.w:
    w /= (w.shape[1])**0.5

for ep in range(50):
    m1.fit(x_train, y_train, 1, 10, 3.0)
    m2.fit(x_train, y_train, 1, 10, 3.0)
    scores[0][ep],acc = m1.evaluate(x_train, y_train)
    scores[1][ep],acc = m2.evaluate(x_train, y_train)

vep = np.linspace(1.,50.,50)
fig = plt.figure(figsize=(6,6), dpi=80)
plt.plot(vep,scores[0], lw=3)
plt.plot(vep,scores[1], lw=3)
plt.show()