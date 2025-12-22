import numpy as np
from scipy.integrate import solve_ivp

m, g, R = 1., 9.8, 1.
t = 0.
y = np.array([np.pi*0.9999,0.])

def f(t,y):     
    theta   = y[0]
    thetap  = y[1]
    thetapp = -g/R*np.sin(theta)
    
    return np.array([thetap,thetapp])

while t<8.:
    sol = solve_ivp(f, [t, t+0.1], y)
    
    y      = sol.y[:,-1]
    t      = sol.t[-1]
    theta  = y[0]
    thetap = y[1]

    print('At %.2f sec : (%+14.10f, %+14.10f)' % (t, theta, thetap))
