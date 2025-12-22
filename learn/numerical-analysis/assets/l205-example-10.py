import numpy as np
import matplotlib.pyplot as plt

xmin, xmax, xbinwidth = 100., 170., 2.
vx = np.linspace(xmin+xbinwidth/2,xmax-xbinwidth/2,35)
vy = np.array(
[7,2,4,4,3,9,8,1,6,6,8,16,36,20,8,6,8,6,4,7,
 4,10,5,6,1,4,3,4,4,6,2,6,9,5,8],dtype='float64')
vyerr = vy**0.5    

plt.plot([xmin, xmax],[0.,0.],c='black',lw=2)
plt.errorbar(vx, vy, vyerr, c='blue', fmt = 'o')
plt.grid()
plt.show()
