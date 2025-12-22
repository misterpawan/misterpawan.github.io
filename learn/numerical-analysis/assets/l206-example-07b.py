import numpy as np
import matplotlib.pyplot as plt
import matplotlib.animation as animation

fig = plt.figure(figsize=(6,6), dpi=80)
ax = plt.axes(xlim=(-1.2,+1.2), ylim=(-1.2,+1.2))

stick, = ax.plot([], [], lw=2, color='black')
ball,  = ax.plot([], [], 'ro', ms=10)
text   = ax.text(0.,1.1,'', fontsize = 16, color='black', ha='center', va='center')

m, g, R = 1., 9.8, 1.
t, h = 0., 0.001
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
    global t,y
    
    for step in range(40):
        k1  = f(t, y)
        k2  = f(t+0.5*h, y+0.5*h*k1)
        k3  = f(t+0.5*h, y+0.5*h*k2)
        k4  = f(t+h, y+h*k3)
        y  += h/6.*(k1+2.*k2+2.*k3+k4)
        t  += h    
    
    theta  = y[0]
    thetap = y[1]   
    
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
