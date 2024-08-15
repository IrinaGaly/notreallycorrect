<template>
  <div class="about__container">
    <img
      :src="imageUrl"
      class="about__background"
      :class="{ 'about__background--margin': isContactShown }"
    />
    <transition name="fade">
      <div v-if="isIntroTyped" class="terminal__about">
        <transition name="fade">
          <div
            v-if="isContactShown"
            class="terminal__about-phone terminal__about-contacts"
          >
            <div class="terminal__about-contact">CONTACT</div>
            <div class="bold">e-mail</div>
            <a
              href="mailto:be@notreallycorrect.com?body=Hello%20There&body=Tvarujeme%20realitu%20do%20poh%C3%A1dek.%20Jak%20vypad%C3%A1%20ta%20Va%C5%A1e%3F"
              class="terminal__about-contact--phone index-toggle margin-bottom-xs db"
              >be@notreallycorrect.com</a
            >
            <div class="bold">Tran Anh Tuan</div>
            <a
              href="tel:+ 420 733 123 578"
              class="cursor-pointer index-toggle phone margin-bottom-xs db"
              >+ 420 733 123 578</a
            >
            <div class="bold">Adam Zajaček</div>
            <a
              href="tel:+ 420 733 123 577"
              class="cursor-pointer index-toggle phone margin-bottom-xs db"
              >+420 733 123 577</a
            >
            <div class="bold">instagram</div>
            <a
              href="https://www.instagram.com/notreallycorrect/"
              class="cursor-pointer index-toggle phone margin-bottom-xs db"
              >notreallycorrect</a
            >
            <div>NotReallyCorrect s.r.o.</div>
            <div class="margin-bottom-xl db">IČO: 21505845</div>
          </div>
        </transition>

        <div class="terminal__about-phone terminal__about-panel">
          <router-link
            to="/projects"
            class="cursor-pointer index-toggle inline bold"
            >notreallycorrect.</router-link
          ><span class="no-wrap index-toggle inline contact bold"
            >| contact |</span
          ><router-link
            to="/projects"
            class="cursor-pointer index-toggle inline"
            >&nbsp;close &#10005;</router-link
          >
        </div>
      </div>
    </transition>
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
          <span data-toBeTyped=" "></span>
          <span
            id="about-link"
            data-toBeTyped="contact"
            class="cursor-pointer"
          ></span>
          <span data-toBeTyped=" | "></span>
          <span
            id="index-toggle"
            data-toBeTyped="close &#10005;"
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
const aboutText = ref<string[]>([]);

const typeGreetingWithCallback = () => {
  elementsToType.value = document.querySelectorAll("nav > *");
  const genericTextElement = document.querySelector("#generic-text");
  const typerInstance = typer("#generic-text", greetingSpeed.value);
  typerInstance
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
        let typerInstance = typer(genericTextElement, greetingSpeed.value);

        aboutText.value.forEach((line, index) => {
          typerInstance
            .line(line)
            .pause(greetingSpeed.value.max + 300)
            .back("all", greetingSpeed.value.max);
        });

        typerInstance.end(() => {
          typeLoop(); // Recursively call typeLoop to repeat the typing animation
        });
      };

      // Start the loop
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
  aboutText.value = localStorage.getItem("aboutText")?.split("\n") ?? [""];

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
