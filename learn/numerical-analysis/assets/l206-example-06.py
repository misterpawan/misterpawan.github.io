import numpy as np
import matplotlib.pyplot as plt
import matplotlib.animation as animation

fig = plt.figure(figsize=(6,6), dpi=80)
ax = plt.axes(xlim=(-1.,+1.), ylim=(-1.,+1.))

curve, = ax.plot([], [], lw=2, color='red')
    
def init():
    curve.set_data([], [])
    return curve,

def animate(i):
    t = np.linspace(0.,np.pi*2.,400)
    x = np.cos(t*6.)*np.cos(t+2.*np.pi*i/360.)
    y = np.cos(t*6.)*np.sin(t+2.*np.pi*i/360.)
    
    curve.set_data(x, y)
    return curve, 

anim = animation.FuncAnimation(fig, animate, init_func=init,
                               frames=360, interval=40)
plt.show()    
