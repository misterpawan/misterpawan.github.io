from midi_phraser import *

data = decode_midi('ff7prelu.mid')

all_chords = sorted(set(data))
n_chords = len(all_chords)
chords_to_idx = dict((v, i) for i,v in enumerate(all_chords))
idx_to_chords = dict((i, v) for i,v in enumerate(all_chords))

print('Total # of chords:',n_chords)
print('Total # of notes:',len(data))

length = 128
x_train, y_train = [], []

for idx in range(len(data)-length):
    sequence = data[idx:idx+length]
    next = data[idx+length]
        
    x_train.append([chords_to_idx[s] for s in sequence])
    y = np.zeros(n_chords)
    y[chords_to_idx[next]] = 1.
    y_train.append(y)

x_train, y_train = np.array(x_train), np.array(y_train)

from keras.layers import LSTM, Dropout, Dense
from keras.layers import Activation, Input, Embedding
from keras.models import Sequential, Model

model = Sequential()
model.add(Embedding(n_chords, 128, input_length=length))
model.add(LSTM(128, return_sequences=True))
model.add(Dropout(0.3))
model.add(LSTM(128, return_sequences=True))
model.add(Dropout(0.3))
model.add(LSTM(128))
model.add(Dropout(0.3))
model.add(Dense(n_chords))
model.add(Activation('softmax'))
model.compile(loss='categorical_crossentropy', optimizer='rmsprop')

model.fit(x_train, y_train, epochs=200, batch_size=64)
model.save_weights('weights-ex04.h5')
