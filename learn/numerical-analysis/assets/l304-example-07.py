
import numpy as np
import matplotlib.pyplot as plt

x_train = np.load('font_data.npy')
x_train = x_train/127.5-1.

latent_size = 128
img_shape = (48,48)

from keras.layers import Input, Dense, Reshape
from keras.layers import BatchNormalization, LeakyReLU
from keras.models import Sequential, Model
from keras.optimizers import Adam

discriminator = Sequential()
discriminator.add(Reshape((np.prod(img_shape),),input_shape=img_shape))
discriminator.add(Dense(512))
discriminator.add(LeakyReLU())
discriminator.add(Dense(256))
discriminator.add(LeakyReLU())
discriminator.add(Dense(1, activation='sigmoid'))
discriminator.compile(loss='binary_crossentropy',
                      optimizer=Adam(0.0002, 0.5),
                      metrics=['accuracy'])

generator = Sequential()
generator.add(Dense(256, input_dim=latent_size))
generator.add(LeakyReLU())
generator.add(BatchNormalization())
generator.add(Dense(512))
generator.add(LeakyReLU())
generator.add(BatchNormalization())
generator.add(Dense(1024))
generator.add(LeakyReLU())
generator.add(BatchNormalization())
generator.add(Dense(np.prod(img_shape), activation='tanh'))
generator.add(Reshape(img_shape))

noise = Input(shape=(latent_size,))
img = generator(noise)
discriminator.trainable = False
validity = discriminator(img)
combined = Model(noise, validity)
combined.compile(loss='binary_crossentropy', optimizer=Adam(0.0002, 0.5))

noise_test = np.random.randn(100, latent_size)
batch_size = 32
for epoch in range(20001):
    
    imgs_real = x_train[np.random.randint(0, len(x_train), batch_size)]
    
    noise = np.random.randn(batch_size, latent_size)
    imgs_fake = generator.predict(noise)

    dis_loss_real = discriminator.train_on_batch(imgs_real, np.ones((batch_size,1)))
    dis_loss_fake = discriminator.train_on_batch(imgs_fake, np.zeros((batch_size,1)))
    dis_loss = np.add(dis_loss_real,dis_loss_fake)*0.5

    noise = np.random.randn(batch_size, latent_size)
    gen_loss = combined.train_on_batch(noise, np.ones((batch_size,1)))
                                       
    print("Epoch: %d, discriminator(loss: %.3f, acc.: %.2f%%), generator(loss: %.3f)" %
          (epoch, dis_loss[0], dis_loss[1]*100., gen_loss))

    if epoch % 400 == 0:
        imgs_fake = generator.predict(noise_test)
                                       
        fig = plt.figure(figsize=(10,10), dpi=80)
        plt.subplots_adjust(0.05,0.05,0.95,0.95,0.1,0.1)
        for i in range(100):
            plt.subplot(10,10,i+1)
            plt.axis('off')
            plt.imshow(imgs_fake[i], cmap='Greys')
        fig.suptitle('epoch: %05d' % epoch, color='Blue', fontsize=16)
        fig.savefig("%05d.png" % epoch)
        plt.close()
