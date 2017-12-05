<template>
    <div class = "demo home">
      <a v-for = "model in mode_info" v-bind:key="model.path" :href = "`#/${model.path}`">
        <div class="demo-card">
          <div class="demo-card-image"><img :src="model.imagePath" /></div>
          <div class="demo-card-heading">{{ model.title }}</div>
        </div>
      </a>
    </div>
</template>

<script>

const DemoModels = [
    { title: 'Basic Convnet for MNIST', path: 'mnist-cnn' },
    {
      title: 'Convolutional Variational Autoencoder, trained on MNIST',
      path: 'mnist-vae'
    },
    {
      title: 'Auxiliary Classifier Generative Adversarial Network, trained on MNIST',
      path: 'mnist-acgan'
    },
    { title: '50-layer Residual Network, trained on ImageNet', path: 'resnet50' },
    { title: 'Inception v3, trained on ImageNet', path: 'inception-v3' },
    {
      title: 'SqueezeNet v1.1, trained on ImageNet',
      path: 'squeezenet-v1.1'
    },
    {
      title: 'Bidirectional LSTM for IMDB sentiment classification',
      path: 'imdb-bidirectional-lstm'
    }
]

export default {
  data: function () {
    return { mode_info: DemoModels }
  }
}
</script>

<style scoped lang="postcss">
@import '../variables.css';

.demo-card {
  font-family: var(--font-sans-serif);
  width: 100%;
  max-width: 1000px;
  margin: 30px auto;
  background: whitesmoke;
  cursor: default;
  user-select: none;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  overflow: hidden;
  box-shadow: 3px 3px #cccccc;
  transition: box-shadow 0.2s ease-out;

  &:first-child {
    margin-top: 0;
  }

  &:hover {
    box-shadow: 3px 3px 5px var(--color-green-light);
    cursor: pointer;

    & .demo-card-heading {
      color: var(--color-green);
    }
  }
}

.demo-card-heading {
  flex: 1;
  padding: 20px;
  text-align: center;
  color: var(--color-lightgray);
  font-size: 18px;
  transition: color 0.2s ease-out;
}

.demo-card-image {
  & img {
    width: 150px;
    height: auto;
  }
}
</style>