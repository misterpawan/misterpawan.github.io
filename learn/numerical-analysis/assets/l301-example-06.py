import numpy as np
import matplotlib.pyplot as plt
from sklearn import svm

mnist = np.load('mnist.npz')
x_train = mnist['x_train'][:10000]/255.
y_train = mnist['y_train'][:10000]
x_test = mnist['x_test']/255.
y_test = mnist['y_test']

x_train = np.array([img.reshape((784,)) for img in x_train])
x_test = np.array([img.reshape((784,)) for img in x_test])

clf = svm.SVC(kernel='linear', verbose=True)
clf.fit(x_train, y_train)

s_train = clf.score(x_train, y_train)
s_test = clf.score(x_test, y_test)
print('Performance (training):', s_train)
print('Performance (testing):', s_test)

p_test = clf.predict(x_test)

fig = plt.figure(figsize=(10,10), dpi=80)
for i in range(100):
    plt.subplot(10,10,i+1)
    plt.axis('off')
    plt.imshow(mnist['x_test'][i], cmap='Greys')
    c='Green'
    if y_test[i]!=p_test[i]: c='Red'
    plt.text(0.,0.,'$%d\\to%d$' % (y_test[i],p_test[i]),color=c,fontsize=15)
plt.show()
