import numpy as np
from vpython import *
from scipy.integrate import solve_ivp

scene = canvas(width=480, height=480)
floor = box(pos=vector(0.,-1.1,0.), length=2.2, height=0.01, width=1.2, opacity=0.2)
ball = sphere(radius=0.05, color=color.red)
rod = cylinder(pos=vector(0.,0.,0.),axis=vector(1,0,0), radius=0.01, color=color.white)
txt = label( pos=vec(0,1.4,0), text='', line=False)

m, g, R = 1., 9.8, 1.
t = 0.
y = np.array([np.pi*0.9999,0.])

def f(t,y):     
    theta   = y[0] 
    thetap  = y[1]
    thetapp = -g/R*np.sin(theta)
    
    return np.array([thetap,thetapp])

while True:
    sol = solve_ivp(f, [t, t+0.040], y)
    y   = sol.y[:,-1]
    t   = sol.t[-1]
    
    theta   = y[0]
    thetap  = y[1]
    
    ball.pos.x =  np.sin(theta)
    ball.pos.y = -np.cos(theta)
    rod.axis = ball.pos
    
    E = m*g*ball.pos.y + 0.5*m*(R*thetap)**2
    txt.text = 'E = %.16f' % E
    
    rate(1./0.040)