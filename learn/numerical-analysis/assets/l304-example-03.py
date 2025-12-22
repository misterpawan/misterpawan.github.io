from midi_phraser import *

data = decode_midi('mozk219a.mid')

all_chords = sorted(set(data))
n_chords = len(all_chords)
chords_to_idx = dict((v, i) for i,v in enumerate(all_chords))
idx_to_chords = dict((i, v) for i,v in enumerate(all_chords))

print('Total # of chords:',n_chords)
for key in chords_to_idx:
    print(key,'==>',chords_to_idx[key])

print('Encoded data:')
for p in data:
    print(chords_to_idx[p],'',end='')
print(',',len(data),'notes in total.')