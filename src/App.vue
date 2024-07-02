<template>
  <div v-if="isHomeRoute" class="home">
    <div class="home__background" :style="backgroundImage">
      <router-link to="/about">
        <img class="logo" src="./assets/notreallycorrect_logo.png" />
      </router-link>
    </div>
  </div>

  <router-view v-slot="{ Component }">
    <transition name="fade">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<script setup lang="ts">
import axios from "axios";
import { ref, computed, onMounted } from "vue";
import router from "@/router";

const spaceId = "0r2vua7pt9sl";
const accessToken = "G6fwMG2PqGK3z-C50t123AltfdwG5Sgc6a8B9FUQHmw";
const contentTypeId = "main";

const backgroundImage = ref({});
const isHomeRoute = computed(
  () =>
    router.currentRoute.value.name === "Home" ||
    router.currentRoute.value.name === "/",
);

const setBackground = async () => {
  return await axios
    .get(
      `https://cdn.contentful.com/spaces/${spaceId}/entries?content_type=${contentTypeId}&access_token=${accessToken}`,
    )
    .then((response) => {
      backgroundImage.value = {
        backgroundImage: `url(${response.data.includes.Asset[0].fields.file.url})`,
      };
    });
};

onMounted(() => {
  setBackground();
});
</script>

<style lang="scss">
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease-out;

  .project {
    transform: scale(0.5);
  }
}

#app {
  min-height: 100vh;
  height: 100%;
}

.home {
  width: 100%;
  min-height: 100vh;
  height: 100%;
  background: black;
  display: flex;
  justify-content: center;
  align-items: center;
}

.home__background {
  width: 80%;
  min-height: 80vh;
  height: 80%;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  display: flex;
  justify-content: center;
  align-items: center;
}

.logo {
  width: 120px;
  height: 120px;
}
</style>
