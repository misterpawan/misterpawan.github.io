from midi_phraser import *

sources = ['mozk216a.mid','mozk216b.mid','mozk216c.mid',
           'mozk218a.mid','mozk218b.mid','mozk218c.mid',
           'mozk219a.mid','mozk219b.mid','mozk219c.mid']
all_data = []
for src in sources:
    data = decode_midi(src, 2)
    all_data.append(data)

all_chords = sorted(set([s for data in all_data for s in data]))
n_chords = len(all_chords)
chords_to_idx = dict((v, i) for i,v in enumerate(all_chords))
idx_to_chords = dict((i, v) for i,v in enumerate(all_chords))

length = 128

from keras.layers import LSTM, Dropout, Dense
from keras.layers import Activation, Input, Embedding
from keras.models import Sequential, Model

model = Sequential()
model.add(Embedding(n_chords, 128, input_length=length))
model.add(LSTM(256, return_sequences=True))
model.add(Dropout(0.3))
model.add(LSTM(256, return_sequences=True))
model.add(Dropout(0.3))
model.add(LSTM(256))
model.add(Dropout(0.3))
model.add(Dense(n_chords))
model.add(Activation('softmax'))
model.compile(loss='categorical_crossentropy', optimizer='rmsprop')

model.load_weights('weights-ex05.h5')

x_test = np.array([np.random.randint(0,n_chords,length)])
result = []
temperature=0.5
for seq in range(512):
    y_test = model.predict(x_test, verbose=0)[0]
    
    repeats = [np.all(x_test[:,-n:]==x_test[:,-n*2:-n]) for n in [2,3,4]]
    if np.any(repeats): temperature *= 1.20
    else: temperature *= 0.95
    temperature = min(max(temperature, 0.2),5.0)
    
    y_test = y_test**(1./temperature)
    idx = np.random.choice(range(n_chords),p=y_test/y_test.sum())
    result.append(idx_to_chords[idx])
    print('#%d: %s, T=%.2f' % (seq,result[-1],temperature))
    
    x_test[:,:-1] = x_test[:,1:]
    x_test[:,-1] = idx

encode_midi('test.mid', result)
