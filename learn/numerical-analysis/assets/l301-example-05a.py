import numpy as np
import matplotlib.pyplot as plt
from sklearn import svm

mnist = np.load('mnist.npz')
x_train = mnist['x_train'][mnist['y_train']<=1]/255.
y_train = mnist['y_train'][mnist['y_train']<=1]
x_train = np.array([[img.mean(),img[10:18,11:17].mean()] for img in x_train])

clf = svm.SVC(kernel='linear', C=1.0)
clf.fit(x_train, y_train)

fig = plt.figure(figsize=(6,6), dpi=80)

xv, yv = np.meshgrid(np.linspace(0.,0.45,100),np.linspace(-0.05,1.05,100))
zv = clf.predict(np.c_[xv.ravel(), yv.ravel()])
plt.contourf(xv, yv, zv.reshape(xv.shape), alpha=.3, cmap='Blues')

plt.scatter(x_train[:,0][y_train==0], x_train[:,1][y_train==0], c = 'y', s=5, alpha=0.8)
plt.scatter(x_train[:,0][y_train==1], x_train[:,1][y_train==1], c = 'g', s=5, alpha=0.8)
plt.show()

