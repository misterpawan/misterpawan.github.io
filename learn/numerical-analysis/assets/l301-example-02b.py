import numpy as np
import matplotlib.pyplot as plt

mnist = np.load('mnist.npz')
x_train = mnist['x_train']
y_train = mnist['y_train']

sample0 = x_train[y_train==0]/255.
sample1 = x_train[y_train==1]/255.

all_mean0 = sample0.mean(axis=(1,2))
all_mean1 = sample1.mean(axis=(1,2))

center_mean0 = sample0[:,10:18,11:17].mean(axis=(1,2))
center_mean1 = sample1[:,10:18,11:17].mean(axis=(1,2))

roc1_y = np.array([(all_mean1<th).sum()/len(all_mean1) for th in np.linspace(0.0,0.4,200)])
roc1_x = np.array([(all_mean0<th).sum()/len(all_mean0) for th in np.linspace(0.0,0.4,200)])

roc2_y = np.array([(center_mean1>th).sum()/len(center_mean1) for th in np.linspace(-0.01,1.,200)])
roc2_x = np.array([(center_mean0>th).sum()/len(center_mean0) for th in np.linspace(-0.01,1.,200)])

auc1, auc2 = 0., 0.
for i in range(200-1):
    h = abs(roc1_x[i+1]-roc1_x[i])
    auc1 += h*(roc1_y[i+1]+roc1_y[i])*0.5
    h = abs(roc2_x[i+1]-roc2_x[i])
    auc2 += h*(roc2_y[i+1]+roc2_y[i])*0.5

print('AUC(average of all pixels): ',auc1)
print('AUC(average of centered pixels): ',auc2)

fig = plt.figure(figsize=(6,6), dpi=80)
plt.plot(roc1_x, roc1_y, lw=3)
plt.plot(roc2_x, roc2_y, lw=3)
plt.plot([0,1],[0,1], ls='--', c='gray')
plt.grid()
plt.show()