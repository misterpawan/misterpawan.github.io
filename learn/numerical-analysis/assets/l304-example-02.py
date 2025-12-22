from midi_phraser import *

data = decode_midi('mozk219a.mid')

for idx, chord in enumerate(data):
    print('#%d: %s' % (idx,chord))

encode_midi('test.mid', data)