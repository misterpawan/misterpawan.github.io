import numpy as np
from vpython import *
from scipy.integrate import solve_ivp

scene = canvas(width=480, height=480)
floor = box(pos=vector(0.,-1.1,0.), length=2.2, height=0.01, width=1.2, opacity=0.2)
ball = sphere(radius=0.05, color=color.red)
spring = helix(pos=vector(0.,0.,0.), axis=vector(1,0,0), radius=0.07, color=color.orange)
txt = label( pos=vec(0,1.4,0), text='', line=False)

m, g, R0, k = 1., 9.8, 0.5, 100.
t = 0.
y = np.array([0.3,0.4,0.,0.])

def f(t,y):
    bx, by = y[0], y[1]
    vx, vy = y[2], y[3]
    R = (bx**2+by**2)**0.5
    
    fs = -k*(R-R0)
    ax = fs*bx/R/m
    ay = fs*by/R/m - g
    
    return np.array([vx,vy,ax,ay])

while True:
    sol = solve_ivp(f, [t, t+0.040], y)
    y   = sol.y[:,-1]
    t   = sol.t[-1]

    bx, by = y[0], y[1]
    vx, vy = y[2], y[3]
    R = (bx**2+by**2)**0.5

    ball.pos.x = bx
    ball.pos.y = by
    spring.axis = ball.pos
    
    E = m*g*by + 0.5*m*(vx**2+vy**2) + 0.5*k*(R-R0)**2
    txt.text = 'E = %.16f' % E
    
    rate(1./0.040)