import numpy as np
import scipy.optimize as opt
import matplotlib.pyplot as plt

xmin, xmax, xbinwidth = 100., 170., 2.
vx = np.linspace(xmin+xbinwidth/2,xmax-xbinwidth/2,35)
vy = np.array(
[7,2,4,4,3,9,8,1,6,6,8,16,36,20,8,6,8,6,4,7,
 4,10,5,6,1,4,3,4,4,6,2,6,9,5,8],dtype='float64')
vyerr = vy**0.5

plt.plot([xmin, xmax],[0.,0.],c='black',lw=2)
plt.errorbar(vx, vy, vyerr, c='blue', fmt = 'o')

def model(x, norm, mean, sigma, c0, c1, c2):
    
    xp = (x-xmin)/(xmax-xmin)
    polynomial = c0 + c1*xp + c2*xp**2
    
    gaussian = norm*xbinwidth/(2.*np.pi)**0.5/sigma * \
        np.exp(-0.5*((x-mean)/sigma)**2)
    
    return polynomial + gaussian

p_init = np.array([70.,125.,2.,4.,0.,0.])
rx,rcov = opt.curve_fit(model,vx,vy,p_init,vyerr)

if np.any(rx != p_init):
    print('N(Higgs) = %.1f +- %.1f events' % (rx[0],rcov[0,0]**0.5))
    print('M(Higgs) = %.1f +- %.1f GeV' % (rx[1],rcov[1,1]**0.5))
    
    cx = np.linspace(xmin,xmax,500)
    cy = model(cx,rx[0],rx[1],rx[2],rx[3],rx[4],rx[5]) 
    cy_bkg = model(cx,0.,rx[1],rx[2],rx[3],rx[4],rx[5])    
    
    plt.plot(cx, cy, c='red',lw=2)
    plt.plot(cx, cy_bkg, c='red',lw=2,ls='--')
    
plt.grid()
plt.show()