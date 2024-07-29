<template>
  <div class="about__container">
    <img :src="imageUrl" class="about__background" />

    <div v-if="isIntroTyped" class="terminal__about">
      <div>
        <router-link to="/" class="cursor-pointer index-toggle inline"
          >notreallycorrect.</router-link
        ><span class="no-wrap index-toggle inline contact">| contact |</span
        ><router-link to="/projects" class="cursor-pointer index-toggle inline"
          >close X</router-link
        >
      </div>

      <template v-if="isContactShown">
        <a
          href="tel:+ 420 777 777 777"
          class="terminal__about-contact terminal__about-contact--phone index-toggle"
          >contact us</a
        >
        <a
          href="mailto:notreally@email.com"
          class="terminal__about-contact terminal__about-contact--email index-toggle"
          >email us</a
        >
        <div>
          <a
            href="tel:+ 420 777 777 777"
            class="cursor-pointer index-toggle phone"
            >+ 420 777 777 777</a
          >&nbsp;
          <a
            href="mailto:notreally@email.com"
            class="cursor-pointer index-toggle email"
            >notreally@email.com</a
          >
        </div>
      </template>
    </div>
  </div>
  <Terminal ref="terminal" class="terminal--about">
    <template #content>
      <nav id="generic-text" class="terminal__content"></nav>
      <div v-if="!isIntroTyped">
        <nav id="generic-text" class="terminal__content">
          <span
            id="name"
            data-toBeTyped="notreallycorrect."
            class="font-bold"
          ></span>
          <span data-toBeTyped="  "></span>
          <span
            id="about-link"
            data-toBeTyped="contact"
            class="cursor-pointer"
          ></span>
          <span data-toBeTyped=" | "></span>
          <span
            id="index-toggle"
            data-toBeTyped="close X"
            class="cursor-pointer"
          ></span>
        </nav>
      </div>
    </template>
  </Terminal>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
// @ts-ignore
import typer from "typer-js";
// @ts-ignore
import Terminal from "@/components/Terminal";

const greetingSpeed = ref({ min: 30, max: 50 });
const elementsToType = ref();
const isIntroTyped = ref(false);
const isContactShown = ref(false);
const imageUrl = ref("");

const typeGreetingWithCallback = () => {
  elementsToType.value = document.querySelectorAll("nav > *");
  const genericTextElement = document.querySelector("#generic-text");
  typer(genericTextElement, greetingSpeed.value)
    .line("contact us")
    .pause(greetingSpeed.value.max + 100)
    .back("all", 40)
    .continue("email us")
    .pause(greetingSpeed.value.max + 100)
    .back("all", 40)
    .continue("+ 420 777 777 777")
    .pause(greetingSpeed.value.max + 100)
    .back("all", 40)
    .continue("notreally@email.com")
    .pause(greetingSpeed.value.max + 100)
    .back("all", 40)
    .end(() => {
      genericTextElement && (genericTextElement.innerHTML = "");
      isContactShown.value = true;
      const typeLoop = () => {
        typer(genericTextElement, greetingSpeed.value)
          .line("NotReallyCorrect s.r.o.")
          .pause(greetingSpeed.value.max + 100)
          .continue("<br/>Jsme pohádkáři. Ne tak úplně architekti.")
          .pause(200)
          .back(24, 40)
          .continue("Ne tak úplně designéři.")
          .pause(200)
          .back(23, 40)
          .continue("Ne tak úplně v reálu.")
          .pause(200)
          .back("all", 40)
          .pause(200)
          .end(() => {
            typeLoop();
          });
      };

      typeLoop();
    });
};

const typeGreeting = () => {
  elementsToType.value = document.querySelectorAll("nav > span");
  typeRecursive();
};

const setBackground = () => {
  imageUrl.value = localStorage.getItem("aboutBackground") ?? "";
};

const typeRecursive = (i = 0) => {
  if (i === elementsToType.value.length) {
    setTimeout(() => {
      isIntroTyped.value = true;
    }, 900);
    return;
  }

  const typerino = typer(elementsToType.value[i], greetingSpeed.value);
  const toBeTyped = elementsToType.value[i].getAttribute("data-toBeTyped");

  typerino.line(toBeTyped);

  setTimeout(() => {
    typeRecursive(i + 1);
  }, 75 * toBeTyped.length);
};

onMounted(() => {
  greetingSpeed.value = {
    min:
      Number(localStorage.getItem("removeSpeed")) >=
      Number(localStorage.getItem("typeSpeed"))
        ? Number(localStorage.getItem("typeSpeed"))
        : Number(localStorage.getItem("removeSpeed")),
    max:
      Number(localStorage.getItem("removeSpeed")) >=
      Number(localStorage.getItem("typeSpeed"))
        ? Number(localStorage.getItem("removeSpeed")) + 1
        : Number(localStorage.getItem("typeSpeed")),
  };
  typeGreeting();
  setBackground();
});

watch(
  () => isIntroTyped.value,
  () => {
    typeGreetingWithCallback();
  },
);
</script>
