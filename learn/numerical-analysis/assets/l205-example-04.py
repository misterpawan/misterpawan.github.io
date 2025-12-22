
def squareroot(R):
    fsq = lambda x:x*x-R
    fsqp = lambda x:2.*x
    
    a, b, c = 0., R*0.5, R
    fa, fb, fc = fsq(a), fsq(b), fsq(c)
    for step in range(50):	
        delta = -fb/fsqp(b)
        d  = b + delta
        fd = fsq(d)

        if abs(b-d)<1E-14: return d
        b, fb = d, fd

def cubicroot(R):
    fcb = lambda x:x*x*x-R
    fcbp = lambda x:3.*x*x
    
    a, b, c = 0., R*0.5, R
    fa, fb, fc = fcb(a), fcb(b), fcb(c)
    for step in range(50):	
        delta = -fb/fcbp(b)
        d  = b + delta
        fd = fcb(d)

        if abs(b-d)<1E-14: return d
        b, fb = d, fd
	
R = 1234.

print('root = %.16f, diff = %.16f' % \
    (squareroot(R),abs(R**0.5-squareroot(R))))

print('root = %.16f, diff = %.16f' % \
    (cubicroot(R),abs(R**(1./3.)-cubicroot(R))))
