import numpy as np
import matplotlib.pyplot as plt

class rnd:
    def __init__(self, s = 1234):
        self.seed = s
        
    def gen(self):
        self.seed = (16807*self.seed) % (2**31-1)
        return self.seed
        
    def random(self):
        return float(self.gen())/(2**31-1)
   
r = rnd()     
        
data = np.zeros(100000)
for i in range(len(data)):
    data[i] = r.random()
    
plt.hist(data, bins=50, range=(0.,1.), color='y')
plt.show()