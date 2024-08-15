<template>
  <router-view v-slot="{ Component }">
    <component :is="Component" />
  </router-view>
</template>

<script lang="ts" setup>
import { onUnmounted } from "vue";

onUnmounted(() => {
  localStorage.removeItem("typeSpeed");
  localStorage.removeItem("removeSpeed");
  localStorage.removeItem("aboutBackground");
  localStorage.removeItem("welcomeText");
  localStorage.removeItem("aboutText");
});
</script>
