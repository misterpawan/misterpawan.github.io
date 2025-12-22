import numpy as np
import matplotlib.pyplot as plt

np.random.seed(123456)
sig = np.random.randn(1000,2)*0.5
bkg = np.vstack([np.random.randn(1000,2)*[0.4,0.6]+[+1.,+1.],
                 np.random.randn(1000,2)*[0.7,0.3]+[-1.,-1.]])

def fcn(x):
    nsig = ((sig[:,0]>x[0]) & (sig[:,0]<x[1]) & (sig[:,1]>x[2]) & (sig[:,1]<x[3])).sum()
    nbkg = ((bkg[:,0]>x[0]) & (bkg[:,0]<x[1]) & (bkg[:,1]>x[2]) & (bkg[:,1]<x[3])).sum()
    if nsig+nbkg<1: return 0.
    return nsig/(nsig+nbkg)**0.5
    
def crossover(x,y):
    return [np.random.choice([v,w]) for v,w in zip(x,y)]
def mutation(x):
    return [v+np.random.randn()*0.2 if np.random.rand()<0.2 else v for v in x]

population = 100 # size of population
chromo = [np.random.rand(4)*4.-2. for i in range(population)] # initial chromosome
fitness = [fcn(x) for x in chromo]
for gen in range(100):
    for idx in range(population):
        pick = np.random.randint(0,population,2)
        x = crossover(chromo[pick[0]],chromo[pick[1]])
        x = mutation(x)
        chromo.append(x)
        fitness.append(fcn(x))
        
    rank = (-np.array(fitness)).argsort()[:population] # drop low rank chromosome
    chromo = [chromo[i] for i in rank]
    fitness = [fitness[i] for i in rank]
    print('gen:',gen+1,'best chromo =',chromo[0],'fitness =',fitness[0])
    
    if np.array(fitness).std()/np.array(fitness).mean()<1E-3: break
    
box = chromo[0]
plt.figure(figsize=(6, 6), dpi=80)
plt.scatter(sig[:,0],sig[:,1],c='red',alpha=0.5,s=10,marker='o')
plt.scatter(bkg[:,0],bkg[:,1],c='black',alpha=0.5,s=10,marker='o')
plt.plot([box[0],box[0],box[1],box[1],box[0]],[box[2],box[3],box[3],box[2],box[2]],lw=3,c='blue')
plt.show()
    
