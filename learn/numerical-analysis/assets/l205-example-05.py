import scipy.optimize as opt
 
def squareroot(R):
    fsq = lambda x:x*x-R
    fsqp = lambda x:2.*x
    
    return opt.newton(fsq,R*0.5,fsqp)

R = 1234.
   
print('root = %.16f, diff = %.16f' % \
    (squareroot(R),abs(R**0.5-squareroot(R))))
