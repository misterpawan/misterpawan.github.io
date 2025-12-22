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

print('Total # of chords:',n_chords)

length = 128
x_train, y_train = [], []

for data_idx, data in enumerate(all_data):
    print('Song',data_idx,'- # of notes:',len(data))
    for idx in range(len(data)-length):
        sequence = data[idx:idx+length]
        next = data[idx+length]
        
        x_train.append([chords_to_idx[s] for s in sequence])
        y = np.zeros(n_chords)
        y[chords_to_idx[next]] = 1.
        y_train.append(y)

x_train, y_train = np.array(x_train), np.array(y_train)
print('Total # of training samples:',len(x_train))

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

model.fit(x_train, y_train, epochs=150, batch_size=64)
model.save_weights('weights-ex05.h5')
