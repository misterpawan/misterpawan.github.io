import numpy as np
import matplotlib.pyplot as plt

t = np.linspace(0, 4, 200)

# "Hat" functions (Linear B-Splines)
def b1(x): return np.where((x>=0)&(x<2), np.where(x<1, x, 2-x), 0)
def b2(x): return np.where((x>=1)&(x<3), np.where(x<2, x-1, 3-x), 0)
def b3(x): return np.where((x>=2)&(x<4), np.where(x<3, x-2, 4-x), 0)

plt.figure(figsize=(8, 3))
plt.fill_between(t, b1(t), alpha=0.5, label='$B_1$')
plt.fill_between(t, b2(t), alpha=0.5, label='$B_2$')
plt.fill_between(t, b3(t), alpha=0.5, label='$B_3$')

plt.title('Linear B-Splines ($1^{st}$ order)')
plt.legend()
plt.show()
