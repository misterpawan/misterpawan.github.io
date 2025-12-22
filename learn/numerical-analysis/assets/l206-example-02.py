import math

def f(t,y): return y

t, y = 0., 1.
h = 0.001

while t<1.:
    k1  = f(t, y)
    k2  = f(t+0.5*h, y+0.5*h*k1)
    y  += h*k2
    t  += h

y_exact = math.exp(t)
print('RK2 method: %.16f, exact: %.16f, diff: %.16f' % \
(y,y_exact,abs(y-y_exact)))