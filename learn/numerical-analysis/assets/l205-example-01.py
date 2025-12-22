def f(x):
    return (x-1.)*(x-2.)*(x-3.)*(x-4.)*(x-5.)

a, b = 2.4, 3.4
fa, fb = f(a), f(b)

for step in range(50):
    c = (a+b)*0.5
    fc = f(c)	

    print('Step: %2d, root = %.16f, diff = %.16f' % (step,c,abs(c-3.)))
    
    if abs(a-c)<1E-14: break
    
    if fc*fa>0.:
        a, fa = c, fc
    else:
        b, fb = c, fc
