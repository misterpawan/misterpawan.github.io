import numpy as np
import matplotlib.pyplot as plt

def f(t,y): return y

vt,y1,vy2,vy4 = [],[],[],[]

t = 0.
y1 = y2 = y4 = 1.
h = 0.001
while t<200.:
    k1  = f(t, y1)
    y1 += h*k1
    
    k1  = f(t, y2)
    k2  = f(t+0.5*h, y2+0.5*h*k1)
    y2 += h*k2

    k1  = f(t, y4)
    k2  = f(t+0.5*h, y4+0.5*h*k1)
    k3  = f(t+0.5*h, y4+0.5*h*k2)
    k4  = f(t+h, y4+h*k3)
    y4 += h/6.*(k1+2.*k2+2.*k3+k4)
    
    t += h
    
    vt.append(t)
    vy1.append(abs(y1-np.exp(t))/np.exp(t))
    vy2.append(abs(y2-np.exp(t))/np.exp(t))
    vy4.append(abs(y4-np.exp(t))/np.exp(t))

plt.plot(vt,vy1,lw=2,c='Blue')
plt.plot(vt,vy2,lw=2,c='Green')
plt.plot(vt,vy4,lw=2,c='Red')
plt.yscale('log')
plt.ylim(1E-16,0.2)
plt.show()