import numpy as np
from vpython import *
from scipy.integrate import solve_ivp

scene = canvas(width=480, height=480)
floor = box(pos=vector(0.,-1.1,0.), length=2.2, height=0.01, width=1.2, opacity=0.2)
ball1 = sphere(radius=0.05, color=color.red)
ball2 = sphere(radius=0.05, color=color.yellow)
spring1 = helix(pos=vector(0.,0.,0.), axis=vector(1,0,0), radius=0.07, color=color.orange)
spring2 = helix(pos=vector(0.,0.,0.), axis=vector(1,0,0), radius=0.07, color=color.orange)
txt = label( pos=vec(0,1.4,0), text='', line=False)

m, g, R0, k = 0.5, 9.8, 0.5, 200.
t = 0.
y = np.array([0.18,-0.24,0.42,-0.42,0.,0.,0.,0.])

def f(t,y):
    bx1, by1 = y[0], y[1]
    bx2, by2 = y[2], y[3]
    vx1, vy1 = y[4], y[5]
    vx2, vy2 = y[6], y[7]
    R1 = (bx1**2+by1**2)**0.5
    R2 = ((bx2-bx1)**2+(by2-by1)**2)**0.5
    
    fs1 = -k*(R1-R0)
    fs2 = -k*(R2-R0)
    
    ax1 = fs1*bx1/R1/m - fs2*(bx2-bx1)/R2/m
    ay1 = fs1*by1/R1/m - fs2*(by2-by1)/R2/m - g
    ax2 = fs2*(bx2-bx1)/R2/m
    ay2 = fs2*(by2-by1)/R2/m - g
    
    return np.array([vx1,vy1,vx2,vy2,ax1,ay1,ax2,ay2])

while True:
    sol = solve_ivp(f, [t, t+0.040], y)
    y   = sol.y[:,-1]
    t   = sol.t[-1]

    bx1, by1 = y[0], y[1]
    bx2, by2 = y[2], y[3]
    vx1, vy1 = y[4], y[5]
    vx2, vy2 = y[6], y[7]
    R1 = (bx1**2+by1**2)**0.5
    R2 = ((bx2-bx1)**2+(by2-by1)**2)**0.5

    ball1.pos.x = bx1
    ball1.pos.y = by1
    ball2.pos.x = bx2
    ball2.pos.y = by2
    
    spring1.axis = ball1.pos
    spring2.pos = ball1.pos
    spring2.axis = ball2.pos-ball1.pos
    
    E = m*g*by1 + m*g*by2 + 0.5*m*(vx1**2+vy1**2) + 0.5*m*(vx2**2+vy2**2) + 0.5*k*(R1-R0)**2 + 0.5*k*(R2-R0)**2
    txt.text = 'E = %.16f' % E
    
    rate(1./0.040)