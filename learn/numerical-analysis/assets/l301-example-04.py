import numpy as np
import matplotlib.pyplot as plt
from sklearn.discriminant_analysis import LinearDiscriminantAnalysis

mnist = np.load('mnist.npz')
x_train = mnist['x_train'][mnist['y_train']<=1]/255.
y_train = mnist['y_train'][mnist['y_train']<=1]
x_test = mnist['x_test'][mnist['y_test']<=1]/255.
y_test = mnist['y_test'][mnist['y_test']<=1]

x_train = np.array([[img.mean(),img[10:18,11:17].mean()] for img in x_train])
x_test = np.array([[img.mean(),img[10:18,11:17].mean()] for img in x_test])

clf = LinearDiscriminantAnalysis()
f_train = clf.fit_transform(x_train, y_train)

s_train = clf.score(x_train, y_train)
s_test = clf.score(x_test, y_test)
print('Performance (training):', s_train)
print('Performance (testing):', s_test)

fig = plt.figure(figsize=(6,6), dpi=80)
plt.hist(f_train[y_train==0], bins=50, color='y')
plt.hist(f_train[y_train==1], bins=50, color='g', alpha=0.5)
plt.show()