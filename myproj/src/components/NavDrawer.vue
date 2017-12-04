<template>
  <aside class="menu">
    <div class="logo"><a href="#/"><img src="../assets/logo-V.png" /></a></div>
    <p class="menu-label">Deep learning models</p>
    <ul class="menu-list">
      <li :class="{ active: currentView === 'mnist-cnn' }">
        <a href="#/mnist-cnn">
          <span class="menu-item-heading">Basic Convnet</span>
          <span class="menu-item-subheading">MNIST</span>
        </a>
      </li>
      <!-- <li :class="{ active: currentView === 'mnist-vae' }">
        <a href="#/mnist-vae">
          <span class="menu-item-heading">Convolutional VAE</span>
          <span class="menu-item-subheading">MNIST</span>
        </a>
      </li>
      <li :class="{ active: currentView === 'mnist-acgan' }">
        <a href="#/mnist-acgan">
          <span class="menu-item-heading">AC-GAN</span>
          <span class="menu-item-subheading">MNIST</span>
        </a>
      </li>
      <li :class="{ active: currentView === 'resnet50' }">
        <a href="#/resnet50">
          <span class="menu-item-heading">ResNet-50</span>
          <span class="menu-item-subheading">ImageNet</span>
        </a>
      </li>
      <li :class="{ active: currentView === 'inception-v3' }">
        <a href="#/inception-v3">
          <span class="menu-item-heading">Inception v3</span>
          <span class="menu-item-subheading">ImageNet</span>
        </a>
      </li>
      <li :class="{ active: currentView === 'squeezenet-v1.1' }">
        <a href="#/squeezenet-v1.1">
          <span class="menu-item-heading">SqueezeNet v1.1</span>
          <span class="menu-item-subheading">ImageNet</span>
        </a>
      </li>
      <li :class="{ active: currentView === 'imdb-bidirectional-lstm' }">
        <a href="#/imdb-bidirectional-lstm">
          <span class="menu-item-heading">Bidirectional LSTM</span>
          <span class="menu-item-subheading">IMDB</span>
        </a>
      </li> -->
    </ul>
  </aside>
</template>

<script>
export default {
  props: {
    currentView: { type: String, default: 'home' }
  }
}
</script>

<style scoped lang="postcss">
@import '../variables.css';

.menu {
  font-family: var(--font-sans-serif);
  padding: 20px 40px;
  background: whitesmoke;
}

.logo {
  & img {
    max-width: 100%;
    max-height: 100%;
  }
}

.menu-label {
  user-select: none;
  cursor: default;
  font-size: 11px;
  color: var(--color-lightgray);
  letter-spacing: 2px;
  text-transform: uppercase;
  margin: 11px 0;
}

.menu-list {
  list-style: none;

  & li {
    color: var(--color-lightgray);
    border-left: 2px solid whitesmoke;
    margin-bottom: 5px;
  }

  & li.active {
    border-left: 2px solid var(--color-green);
  }

  & a {
    padding: 7px 11px;
    color: var(--color-darkgray);
    text-decoration: none;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;

    &:hover {
      color: var(--color-green);
      background-color: whitesmoke;

      & .github-logo {
        fill: var(--color-green);
      }
    }

    & span.menu-item-heading {
      display: flex;
      align-items: center;
      margin-right: 10px;
      font-size: 14px;
    }

    & span.menu-item-subheading {
      color: #999999;
      font-size: 10px;
    }
  }
}

.menu-list.github,
.menu-list.contact {
  & li {
    padding: 5px 10px;
    font-size: 14px;
  }

  & a {
    color: var(--color-green);
    padding: 0;
    display: inline-flex;
    background-color: none;
    transition: color 0.2s ease-in-out;

    & .github-logo {
      fill: var(--color-green);
      transition: fill 0.2s ease-in-out;
      margin-right: 5px;
    }

    &:hover {
      color: var(--color-green-light);
      background: none;

      & .github-logo {
        fill: var(--color-green-light);
      }
    }
  }
}
</style>
