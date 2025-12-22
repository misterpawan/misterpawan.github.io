import numpy as np
import matplotlib.pyplot as plt

np.random.seed(123456)
sig = np.random.randn(1000,2)*0.5
bkg = np.vstack([np.random.randn(1000,2)*[0.4,0.6]+[+1.,+1.],
                 np.random.randn(1000,2)*[0.7,0.3]+[-1.,-1.]])
                 
def fcn(x):
    nsig = ((sig[:,0]>x[0]) & (sig[:,0]<x[1]) & (sig[:,1]>x[2]) & (sig[:,1]<x[3])).sum()
    nbkg = ((bkg[:,0]>x[0]) & (bkg[:,0]<x[1]) & (bkg[:,1]>x[2]) & (bkg[:,1]<x[3])).sum()
    if nsig+nbkg<1: return 0.
    return nsig/(nsig+nbkg)**0.5

vec = [(a,b,c,d) for a in np.arange(-2.,2.1,0.1) for b in np.arange(a,2.1,0.1) for c in np.arange(-2.,2.1,0.1) for d in np.arange(c,2.1,0.1)]
res = np.array([fcn(x) for x in vec])
best = res.argmax()
print('Resulting box =',vec[best],' fcn =',res[best])

box = vec[best]
plt.figure(figsize=(6, 6), dpi=80)
plt.scatter(sig[:,0],sig[:,1],c='red',alpha=0.5,s=10,marker='o')
plt.scatter(bkg[:,0],bkg[:,1],c='black',alpha=0.5,s=10,marker='o')
plt.plot([box[0],box[0],box[1],box[1],box[0]],[box[2],box[3],box[3],box[2],box[2]],lw=3,c='blue')
plt.show()
