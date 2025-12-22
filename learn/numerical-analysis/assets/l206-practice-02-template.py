import numpy as np
import matplotlib.pyplot as plt
from scipy.integrate import solve_ivp

###########################################
# put the correct initial conditions here
###########################################
y = [0.,0.]
t = 0.
###########################################   

def f(t,y):     
###########################################
# modify the code below accordingly        
###########################################
    return np.array([0.,0.])
###########################################      
    
vx = np.zeros(200)
vt = np.zeros(200)
 
for step in range(200):
    sol = solve_ivp(f, [t, t+0.1], y)
    y   = sol.y[:,-1]
    t   = sol.t[-1]

###########################################
# modify the code below accordingly        
###########################################
    x = 0.
    vx[step] = x
    vt[step] = t
###########################################    
    
    print('At %.1f sec : x = %.5f' % (t, x))
    
plt.plot(vt,vx,lw=2,color='blue')    
plt.xlim(0.,20.)
plt.ylim(-0.3,0.3)
plt.grid(True)
plt.xlabel('time (s)')
plt.ylabel('x (m)')
plt.show()
