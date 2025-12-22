import math

def f(x):  
    return x**2+math.exp(x)+math.log(x)+math.sin(x)
def fp(x): 
    return 2.*x+math.exp(x)+1./x+math.cos(x)
def fpp(x):
    return 2.+math.exp(x)-1./(x*x)-math.sin(x)

x, h = 0.5, 1E-2
fpp_exact = fpp(x)

while h>1E-15:
    fpp_numeric = \
    (f(x+h)+f(x-h)-2.*f(x))/(h*h)
    print('h = %e' % h)
    print('Exact = %.16f,' % fpp_exact, end=' ')
    print('Numeric = %.16f,' % fpp_numeric, end=' ')
    print('diff = %.16f' % abs(fpp_numeric-fpp_exact))
    h /= 10.
