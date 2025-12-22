import scipy.fftpack as fftpack
import scipy.io.wavfile as wavfile
import matplotlib.pyplot as plt
import numpy as np
import os

# Ensure data exists 
if not os.path.exists('Sine_wave_440.wav'):
    rate = 44100
    t = np.linspace(0., 1., rate, endpoint=False)
    data = np.sin(2 * np.pi * 440 * t) * 30000
    wavfile.write('Sine_wave_440.wav', rate, data.astype(np.int16))

rate, data = wavfile.read('Sine_wave_440.wav')

# FFT Analysis
fft = abs(fftpack.fft(data[:rate]))
freqs = fftpack.fftfreq(rate, 1./rate)

plt.figure(figsize=(8,6), dpi=80)
plt.plot(freqs[:1200], np.log10(fft[:1200]))
plt.xlabel('Frequency [Hz]')
plt.ylabel('log10(Amplitude)')
plt.show()
