import math

def f(x):
    return x - x**2 + x**3 - x**4 + math.sin(x*13.)/13.
def fint(x):
    return x**2/2. - x**3/3. + x**4/4. - x**5/5. - math.cos(x*13.)/169.

fint_exact = fint(1.2)-fint(0.)
area, x, h = 0., 0., 1E-3
f0 = f1 = f(x)   
while x<1.2-h*0.5:
    f0, f1 = f1, f(x+h)
    x += h	
    area += f0+f1
area *= h/2.
	
print('Exact: %.16f, Numerical: %.16f, diff: %.16f' \
% (fint_exact,area,abs(fint_exact-area)))
