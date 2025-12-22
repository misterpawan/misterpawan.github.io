def f(x):
    return (x-0.5)*(x-0.5)*(x-10.)*(x-10.)
        
def fp(x):
    return 2.*(x-0.5)*(x-10.)*(x-10.)+2.*(x-0.5)*(x-0.5)*(x-10.)

FRAC = 0.38197
a, c = 0.0, 2.0
b = a+(c-a)*FRAC
fa, fb, fc = fp(a), fp(b), fp(c)

for step in range(150):
    R, S, T  = fb/fc, fb/fa, fa/fc
    P  = S*(T*(R-T)*(c-b)-(1.-R)*(b-a))
    Q  = (T-1.)*(R-1.)*(S-1.) 
    d  = b + P/Q
    fd = fp(d)

    if (d-a)*(d-c)>0. or abs(fd)>abs(fb):
        if fa*fb>0.: d = (b+c)*0.5
        else:        d = (a+b)*0.5
        fd = f(d)  
                
    print 'Step: %2d, root = %.16f, diff = %.16f' % (step,d,abs(d-0.5))
    if abs(b-d)<1E-14: break
		
    if fa*fb>0.:
        a, fa = b, fb
        b, fb = d, fd
    else:
        c, fc = b, fb
        b, fb = d, fd
