def f(x):
    return (x-1.)*(x-2.)*(x-3.)*(x-4.)*(x-5.)

def fp(x):
    h = 1E-5
    return (f(x+h/2.)-f(x-h/2.))/h

a, b, c = 2.4, 2.5, 3.4
fa, fb, fc = f(a), f(b), f(c)

for step in range(50):
    
    delta = -fb/fp(b)		
    d  = b + delta
    fd = f(d)
    
    if (d-a)*(d-c)>0. or abs(fd)>abs(fb):
        if fa*fb>0.: d = (b+c)*0.5
        else:        d = (a+b)*0.5
        fd = f(d)
    
    print('Step: %2d, root = %.16f, diff = %.16f' % (step,d,abs(d-3.)))
    
    if abs(b-d)<1E-14: break
    
    b, fb = d, fd