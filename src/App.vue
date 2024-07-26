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
  min-height: 100vh;
  height: 100%;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  display: flex;
  justify-content: center;
  align-items: center;
}

.logo {
  width: 90px;
  height: 90px;
}
</style>
