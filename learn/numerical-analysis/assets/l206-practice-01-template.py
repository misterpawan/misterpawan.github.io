import numpy as np
import matplotlib.pyplot as plt
import matplotlib.animation as animation
from scipy.integrate import solve_ivp

fig = plt.figure(figsize=(6,6), dpi=80)
ax = plt.axes(xlim=(-1.,1.), ylim=(-1.,1.))
blackhole,  = ax.plot([0.], [0.], 'bo', ms=20)
ball,  = ax.plot([], [], 'ro', ms=10)

t = 0.
y = [-1.,-1.,1.,0.5] # (px,py,vx,vy)

def f(t,y):     
###########################################
# modify the code below accordingly        
###########################################

    px = y[0]
    py = y[1]
    vx = y[2]
    vy = y[3]
    ax = 0.
    ay = 0.
    
    return np.array([vx,vy,ax,ay])
    
###########################################      

def init():
    ball.set_data([], [])
    return ball

def animate(i):
    global y, t
    
    sol = solve_ivp(f, [t, t+0.025], y)
    y   = sol.y[:,-1]
    t   = sol.t[-1]
    
    px = y[0]
    py = y[1]
    
    ball.set_data(px, py)
    
    return ball

anim = animation.FuncAnimation(fig, animate, init_func=init,
                               frames=10, interval=40)
plt.show()
