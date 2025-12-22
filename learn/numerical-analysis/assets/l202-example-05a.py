import math

def f(x, n):
    val = 0.
    for i in range(n+1): val += x**i
    return val
def fint(x, n):
    val = 0.
    for i in range(n+1): val += x**(i+1)/(i+1)
    return val

npoints = 5
weights = [[0.5688888888888889,	+0.0000000000000000],
           [0.4786286704993665,	-0.5384693101056831],
           [0.4786286704993665,	+0.5384693101056831],
           [0.2369268850561891,	-0.9061798459386640],
           [0.2369268850561891,	+0.9061798459386640]]
min, max = 0., 1.

for n in range(15):
    fint_exact = fint(max,n)-fint(min,n)
    
    area = 0.
    for i in range(npoints):
        x = ((max-min)*weights[i][1] + (max+min))/2.
        area += f(x,n)*weights[i][0]
    area *= (max-min)/2.

    print('Power: %2d, Exact: %.16f, Numerical: %.16f, diff: %.16f' \
          % (n, fint_exact,area,abs(fint_exact-area)))