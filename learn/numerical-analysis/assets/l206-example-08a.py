import numpy as np
import matplotlib.pyplot as plt
import matplotlib.animation as animation
from scipy.integrate import solve_ivp

fig = plt.figure(figsize=(6,6), dpi=80)
ax = plt.axes(xlim=(-1.2,+1.2), ylim=(-1.2,+1.2))

stick, = ax.plot([], [], lw=2, color='black')
ball,  = ax.plot([], [], 'ro', ms=10)
text   = ax.text(0.,1.1,'', fontsize = 16, color='black', ha='center', va='center')

m, g, R = 1., 9.8, 1.
t = 0.
y = np.array([np.pi*0.9999,0.])

def f(t,y):     
    theta   = y[0] 
    thetap  = y[1]
    thetapp = -g/R*np.sin(theta)
    
    return np.array([thetap,thetapp])

def init():
    stick.set_data([], [])
    ball.set_data([], [])
    text.set(text='')
    return stick, ball, text

def animate(i):
    global t, y
    
    sol = solve_ivp(f, [t, t+0.040], y)
    y   = sol.y[:,-1]
    t   = sol.t[-1]
    
    theta   = y[0]
    thetap  = y[1]
    
    bx =  np.sin(theta)
    by = -np.cos(theta)    
    ball.set_data(bx, by)                                                                                                                                                                              
    stick.set_data([0.,bx], [0.,by])
    
    E = m*g*by + 0.5*m*(R*thetap)**2
    text.set(text='E = %.16f' % E)
    
    return stick, ball, text

anim = animation.FuncAnimation(fig, animate, init_func=init,
                               frames=10, interval=40)
plt.show()    
