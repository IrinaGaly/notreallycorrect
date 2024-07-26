<template>
   <div class="about__container">
     <div class="about__background" :style="backgroundImage"></div>
   </div>
  <Terminal
    ref="terminal"
  >
    <template #content>
      <div v-if="isIntroTyped" class="terminal__about">
        <div>
          <router-link to="/" class="cursor-pointer index-toggle">notreallycorrect.</router-link><span>| contact |</span><router-link to="/projects" class="cursor-pointer index-toggle">close X</router-link>
        </div>
        <div class="terminal__about-contact">contact us</div>
        <div class="terminal__about-contact">email us</div>
        <div>
          <a href="tel:+ 420 777 777 777" class="cursor-pointer index-toggle">+ 420 777 777 777</a>&nbsp;
          <a href="mailto:notreally@email.com" class="cursor-pointer index-toggle"
            >notreally@email.com</a
          >
        </div>
      </div>
      <nav
        id="generic-text"
        class="terminal__content"
      >
      </nav>
    </template>
  </Terminal>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import axios from "axios";
import typer from "typer-js";

import Terminal from "@/components/Terminal";

import { API_ABOUT } from "./utils";

const greetingSpeed = ref({ min: 30, max: 50 });
const elementsToType = ref();
const isIntroTyped = ref(false);
const backgroundImage = ref({});

const typeGreetingWithCallback = () => {
  typer("#generic-text", greetingSpeed.value)
    .line("NotReallyCorrect s.r.o.")
    .pause(greetingSpeed.value.max + 100)
    .continue("<br/>Jsme pohádkáři. Ne tak úplně architekti.")
    .pause(200)

    setTimeout(() => {
      isIntroTyped.value = true
    }, 3000);
};

const typeGreeting = () => {
  elementsToType.value = document.querySelectorAll("nav > *");
  typeGreetingWithCallback();
};

const setBackground = async () => {
  return await axios.get(API_ABOUT).then((response) => {
    backgroundImage.value = {
      backgroundImage: `url(${response.data.includes.Asset[0].fields.file.url})`,
    };
  });
};

onMounted(() => {
  greetingSpeed.value = {
    min: Number(localStorage.getItem('removeSpeed')) >= Number(localStorage.getItem('typeSpeed')) ? Number(localStorage.getItem('typeSpeed')) : Number(localStorage.getItem('removeSpeed')),
    max: Number(localStorage.getItem('removeSpeed')) >= Number(localStorage.getItem('typeSpeed')) ?  Number(localStorage.getItem('removeSpeed')) + 1 : Number(localStorage.getItem('typeSpeed')),
  }
  typeGreeting();
  setBackground();
});

</script>
