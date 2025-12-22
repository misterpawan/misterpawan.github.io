import numpy as np
import scipy.optimize as opt

def f(x):
    return (x[0]-1.)**2+(x[1]-2.)**2+(x[2]-3.)**2

x_init = np.array([0.5,0.5,0.5])

res = opt.minimize(f,x_init)

if res.success:
    print('The resulting vector:',res.x)