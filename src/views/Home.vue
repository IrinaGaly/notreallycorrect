<template>
  <div class="home">
    <router-link
      to="/projects"
      class="home__background"
      :style="backgroundImage"
    >
      <img class="logo" src="./../assets/notreallycorrect_logo.png" />
    </router-link>
  </div>
</template>

<script setup lang="ts">
import axios from "axios";
import { ref, onMounted } from "vue";
import _find from "lodash/find";
import { API_MAIN } from "./utils";

const backgroundImage = ref({});

const setBackground = async () => {
  return await axios.get(API_MAIN).then((response) => {
    backgroundImage.value = {
      backgroundImage: `url(${_find(response.data.includes.Asset, (item) => item.sys.id === response.data.items[0].fields.background.sys.id)?.fields.file.url ?? ""})`,
    };
    localStorage.setItem(
      "removeSpeed",
      response.data.items[0].fields.removeSpeed ?? 50,
    );
    localStorage.setItem(
      "typeSpeed",
      response.data.items[0].fields.typeSpeed ?? 30,
    );
    localStorage.setItem(
      "aboutBackground",
      _find(
        response.data.includes.Asset,
        (item) =>
          item.sys.id === response.data.items[0].fields.aboutBackground.sys.id,
      )?.fields.file.url,
    );
  });
};

onMounted(() => {
  setBackground();
});
</script>
