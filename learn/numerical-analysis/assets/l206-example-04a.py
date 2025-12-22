import numpy as np
import matplotlib.pyplot as plt

def f(t,y): return y

vt4,vy4 = [],[]
vt45,vy45 = [],[]

t, y = 0., 1.
h = 0.001
while t<200.:
    k1  = f(t, y)
    k2  = f(t+0.5*h, y+0.5*h*k1)
    k3  = f(t+0.5*h, y+0.5*h*k2)
    k4  = f(t+h, y+h*k3)
    y  += h/6.*(k1+2.*k2+2.*k3+k4)
    t  += h

    vt4.append(t)
    vy4.append(abs(y-np.exp(t))/np.exp(t))

t, y = 0., 1.
h = 0.001
while t<200.:
    while(True):
        k1  = f(t, y)
        k2  = f(t+1./5.*h, y+1./5.*h*k1)
        k3  = f(t+3./10.*h, y+h*(3./40.*k1 + 9./40.*k2))
        k4  = f(t+3./5.*h, y+h*(3./10.*k1 - 9./10.*k2 + 6./5.*k3))
        k5  = f(t+h,y+h*(-11./54.*k1 + 5./2.*k2 - 70./27.*k3 + 35./27.*k4))
        k6  = f(t+7./8.*h,y+h*(1631./55296.*k1 + 175./512.*k2 + 575./13824.*k3 + 44275./110592.*k4 + 253./4096.*k5))
        
        yn = y+h*(37./378.*k1 + 250./621.*k3 + 125./594.*k4 + 512./1771.*k6)
        yp = y+h*(2825./27648.*k1 + 18575./48384.*k3 + 13525./55296.*k4 + 277./14336.*k5 + 1./4.*k6)
        err = max(abs(yn-yp)/1E-14,0.01)
        if err<1.: break
        
        hn = 0.9*h*err**-0.25
        if hn < h*0.1: hn = h*0.1
        h = hn
    
    y = yn
    t += h

    hn = 0.9*h*err**-0.2
    if hn > h*5.: hn = h*5.
    h = hn

    vt45.append(t)
    vy45.append(abs(y-np.exp(t))/np.exp(t))


plt.plot(vt4,vy4,lw=2,c='Red')
plt.plot(vt45,vy45,lw=2,c='Brown')
plt.yscale('log')
plt.ylim(1E-16,1E-9)
plt.show()