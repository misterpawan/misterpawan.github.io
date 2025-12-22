import scipy
import scipy.io.wavfile as wavfile
import matplotlib.pyplot as plt
import numpy as np

# Create a dummy wave file for the demo
rate = 44100
t = np.linspace(0., 1., rate, endpoint=False)
data = np.sin(2 * np.pi * 440 * t) * 30000 # 440 Hz sine wave
wavfile.write('Sine_wave_440.wav', rate, data.astype(np.int16))

# Read and plot
rate, data = wavfile.read('Sine_wave_440.wav')
t = np.linspace(0., 1., rate, endpoint=False)

plt.figure(figsize=(8,6), dpi=80)
plt.plot(t[:rate//100], data[:rate//100])
plt.xlabel('Time [sec]')
plt.ylabel('Amplitude')
plt.show()
