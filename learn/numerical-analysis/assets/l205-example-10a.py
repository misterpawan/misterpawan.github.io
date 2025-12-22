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
    
def fcn(p):    
    expt = model(vx,p[0],p[1],p[2],p[3],p[4],p[5])
    delta = (vy-expt)/vyerr
    return (delta**2).sum()
    
p_init = np.array([70.,125.,2.,4.,0.,0.])
r = opt.minimize(fcn,p_init)

if r.success:
    print('N(Higgs)  = %.1f events' % r.x[0])
    print('M(Higgs)  = %.1f GeV' % r.x[1])
    print('chi^2/ndf = %.2f' % (fcn(r.x)/(len(vy)-len(r.x))))
    
    cx = np.linspace(xmin,xmax,500)
    cy = model(cx,r.x[0],r.x[1],r.x[2],r.x[3],r.x[4],r.x[5]) 
    cy_bkg = model(cx,0.,r.x[1],r.x[2],r.x[3],r.x[4],r.x[5])    
    
    plt.plot(cx, cy, c='red',lw=2)
    plt.plot(cx, cy_bkg, c='red',lw=2,ls='--')
else:
    print(r.message)
    
plt.grid()
plt.show()
    