import numpy as np

def func(a, b, c, d, e, f):
    return np.sin(a)+np.sin(b*2.)+np.sin(c*3.)+np.cos(d)+np.cos(e*2.)+np.cos(f*3.)

def intfunc(a, b, c, d, e, f):
    return -np.cos(a)-np.cos(b*2.)/2.-np.cos(c*3.)/3.+np.sin(d)+np.sin(e*2.)/2.+np.sin(f*3.)/3.


intf_exact = intfunc(1.,1.,1.,1.,1.,1.)-intfunc(0.,0.,0.,0.,0.,0.)
print("Exact  = %+.5f" % intf_exact)

nsamples = 1000000 # 1 million trials
v = np.random.rand(nsamples,6)
val = func(v[:,0],v[:,1],v[:,2],v[:,3],v[:,4],v[:,5])
intf_rand = val.sum() / nsamples
intf_rand_err = (((val**2).sum()/nsamples-intf_rand**2)/(nsamples-1))**0.5
print("Random = %+.6f +- %.6f" % (intf_rand,intf_rand_err))
print(" (diff = %+.6f)" % (intf_rand-intf_exact))

sep = np.linspace(0.025,0.975,20)
va,vb,vc,vd,ve,vf = np.meshgrid(sep,sep,sep,sep,sep,sep)
intf_boxes = func(va,vb,vc,vd,ve,vf).sum() * 0.05**6
print("Boxes  = %+.6f" % intf_boxes)
print(" (diff = %+.6f)" % (intf_boxes-intf_exact))
