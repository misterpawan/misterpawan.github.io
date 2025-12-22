from midi_phraser import *

data = decode_midi('ff7prelu.mid')

all_chords = sorted(set(data))
n_chords = len(all_chords)
chords_to_idx = dict((v, i) for i,v in enumerate(all_chords))
idx_to_chords = dict((i, v) for i,v in enumerate(all_chords))

length = 128

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

model.load_weights('weights-ex04.h5')

x_test = np.array([np.random.randint(0,n_chords,length)])
result = []
for seq in range(512):
    y_test = model.predict(x_test, verbose=0)[0]
    idx = np.argmax(y_test)
    result.append(idx_to_chords[idx])
    print('#%d: %s' % (seq,result[-1]))

    x_test[:,:-1] = x_test[:,1:]
    x_test[:,-1] = idx

encode_midi('test.mid', result)