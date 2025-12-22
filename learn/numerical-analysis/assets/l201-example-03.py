import math
nsides = 6
length = 1.
print("Polygon Approximation of Pi:")
for i in range(20):
    length = (2. - (4. - length**2)**0.5)**0.5
    nsides *= 2
    pi = length * nsides / 2.
    print(f"Sides: {nsides}, Pi ~ {pi:.16f}")
