def f(x):
    return (x-0.5)*(x-0.5)*(x-10.)*(x-10.)

FRAC = 0.38197
a, c = 0.0, 2.0
fa, fc = f(a), f(c)
b = a+(c-a)*FRAC
fb = f(b)

for step in range(150):

    if abs(a-b)>abs(c-b): d = b+(a-b)*FRAC
    else:                 d = b+(c-b)*FRAC
    fd = f(d)
		
    print('Step: %2d, root = %.16f, diff = %.16f' % (step,d,abs(d-0.5)))
    if abs(b-d)<1E-14: break
		
    if fd<fb:
        b, d = d, b
        fb, fd = fd, fb
	
    if (d-b)*(a-b)>0: a, fa = d, fd
    else:             c, fc = d, fd
