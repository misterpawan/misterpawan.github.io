class rnd:
    def __init__(self, s1 = 1234, s2 = 5678):
        self.s1 = s1
        self.s2 = s2
                
    def gen(self):        
        self.s1 = self.s1 ^ (self.s1 >> 17)
        self.s1 = self.s1 ^ (self.s1 << 31)
        self.s1 = self.s1 ^ (self.s1 >>  8)
        self.s2 = (self.s2 & 0xffffffff)*4294957665 + (self.s2>>32)
        return ((self.s1 ^ self.s2) & 0xffffffff)
	
r = rnd()
for i in range(30):
    print(r.gen(), end=' ')