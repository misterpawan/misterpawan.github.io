import numpy as np
import matplotlib.pyplot as plt

t = np.linspace(0, 1, 100)
plt.figure(figsize=(6, 4))

for k in range(6):
    plt.plot(t, t**k, label=f'$t^{k}$')

plt.title('Monomial Basis Functions on [0,1]')
plt.legend()
plt.grid(True, alpha=0.3)
plt.show()
