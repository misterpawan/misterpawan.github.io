import numpy as np

m, g, R = 1., 9.8, 1.
t, h = 0., 0.001
y = np.array([np.pi*0.9999,0.])

def f(t,y):     
    theta   = y[0] 
    thetap  = y[1]
    thetapp = -g/R*np.sin(theta)
    
    return np.array([thetap,thetapp])

while t<8.:        
    for step in range(100):
        k1  = f(t, y)
        y  += h*k1
        t  += h    
    
    theta  = y[0]
    thetap = y[1]   

    print('At %.2f sec : (%+14.10f, %+14.10f)' % (t, theta, thetap))
