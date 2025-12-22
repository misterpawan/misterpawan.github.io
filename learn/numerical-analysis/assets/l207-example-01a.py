class rnd:
    def __init__(self, s = 1234):
        self.seed = s
        
    def gen(self):
        self.seed = (16807*self.seed) % (2**31-1)
        return self.seed

r = rnd()
for i in range(30):
    print(r.gen(), end=' ')