import numpy as np
from sklearn import svm
from sklearn.model_selection import GridSearchCV

mnist = np.load('mnist.npz')
x_train = mnist['x_train'][mnist['y_train']<=1]/255.
y_train = mnist['y_train'][mnist['y_train']<=1]
x_test = mnist['x_test'][mnist['y_test']<=1]/255.
y_test = mnist['y_test'][mnist['y_test']<=1]

x_train = np.array([[img.mean(),img[10:18,11:17].mean()] for img in x_train])
x_test = np.array([[img.mean(),img[10:18,11:17].mean()] for img in x_test])

clf = svm.SVC(kernel='rbf')

param = {'C':[0.5,5.,50.,500.], 'gamma':[2.0,1.0,0.5,0.25]}
grid = GridSearchCV(clf, param, verbose=3)
grid.fit(x_train, y_train)

print('Best SVM:')
print(grid.best_estimator_)

s_train = grid.score(x_train, y_train)
s_test = grid.score(x_test, y_test)
print('Performance (training):', s_train)
print('Performance (testing):', s_test)
