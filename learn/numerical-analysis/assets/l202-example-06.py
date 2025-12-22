import math
import scipy.integrate as integrate

def f(x):
    return x - x**2 + x**3 - x**4 + math.sin(x*13.)/13.
def fint(x):
    return x**2/2. - x**3/3. + x**4/4. - x**5/5. - math.cos(x*13.)/169.

fint_exact = fint(1.2)-fint(0.)

quad,quaderr = integrate.quad(f,0.,1.2,)

print('Exact: %.16f' %  fint_exact)
print('Numerical: %.16f+-%.16f, diff: %.16f' % \
      (quad,quaderr,abs(fint_exact-quad)))

