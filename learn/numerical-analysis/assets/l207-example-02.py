class rnd:
    def __init__(self, s = 1234):
        self.seed = s
                
    def gen(self):
        self.seed = self.seed ^ (self.seed >> 21)
        self.seed = self.seed ^ (self.seed << 35)
        self.seed = self.seed ^ (self.seed >>  4)
        return (self.seed & 0xffffffff)

r = rnd()
for i in range(30):
    print(r.gen(), end=' ')