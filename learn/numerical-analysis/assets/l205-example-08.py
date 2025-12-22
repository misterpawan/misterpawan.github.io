def f(x):
    return (x-0.5)*(x-0.5)*(x-10.)*(x-10.)
        
def fp(x):
    return 2.*(x-0.5)*(x-10.)*(x-10.)+2.*(x-0.5)*(x-0.5)*(x-10.)

def fpp(x):
    return 2.*(x-10.)*(x-10.)+8.*(x-0.5)*(x-10.)+2.*(x-0.5)*(x-0.5)

FRAC = 0.38197
a, c = 0.0, 2.0
fa, fc = f(a), f(c)
b = a+(c-a)*FRAC
fb = f(b)

for step in range(150):
    delta = -fp(b)/fpp(b)
    d = b + delta

    if (d-a)*(d-c)>0.:
        if abs(a-b)>abs(c-b): d = b+(a-b)*FRAC
        else:                 d = b+(c-b)*FRAC
        
    fd = f(d)		
    print('Step: %2d, root = %.16f, diff = %.16f' % (step,d,abs(d-0.5)))
    if abs(b-d)<1E-14: break
		
    b = d
