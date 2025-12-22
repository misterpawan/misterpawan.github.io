class rnd:
    def __init__(self, s = 1234):
        self.seed = s
        
    def gen(self):
        self.seed = (32533521*self.seed + 2424) % 100
        return self.seed

r = rnd()
for i in range(30):
    print(r.gen(), end=' ')