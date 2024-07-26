<template>
  <router-view v-slot="{ Component }">
    <component :is="Component" />
  </router-view>
</template>

<script>
import { onUnmounted } from 'vue';

onUnmounted(() => {
  localStorage.removeItem('typeSpeed');
  localStorage.removeItem('removeSpeed')
})
</script>

<style lang="scss">
#app {
  min-height: 100vh;
  height: 100%;
}

.home {
  width: 100%;
  min-height: 100vh;
  height: 100%;
}

.home__background {
  width: 100%;
  height: 100%;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  display: flex;
  justify-content: center;
  align-items: center;
}

.about__background {
  min-width: 30vw;
  min-height: 50vh;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  margin-bottom: 10%;
}

.about__container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
}

.logo {
  width: 90px;
  height: 90px;
}
</style>
