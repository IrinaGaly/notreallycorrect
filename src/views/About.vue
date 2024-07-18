<template>
  <div
    id="scrollContainer"
    class="scroll-container"
    v-dragscroll
    @scroll="onScroll"
  >
    <div class="container">
      <template v-if="!isPhone()">
        <ul
          v-for="(group, groupIndex) in projectsLocal"
          :key="groupIndex"
          ref="container"
          class="list"
        >
          <li
            v-for="(project, index) in group"
            :key="`project-${index}`"
            :ref="`element-${groupIndex}-${index}`"
            :id="project.sys.id"
            class="project"
          >
            <Project
              :project="project"
              :asset="projects.includes.Asset"
              @hover-over="(id: string, message: string) => overProject(id, message)"
              @mouseout="returnVisibility"
              @image-loaded="(id: string) => imageLoaded(id)"
              @switch-img-in-project="(id: string) => onImageChange(id)"
            />
          </li>
        </ul>
      </template>
      <template v-else>
        <ul ref="container" class="list-phone">
          <li
            v-for="(project, index) in projectsLocal"
            :key="`project-${index}`"
            :ref="`element-${index}`"
            :id="project.sys.id"
            class="project"
          >
            <Project
              :project="project"
              :asset="projects.includes.Asset"
              @hover-over="(id: string, message: string) => overProject(id, message)"
              @mouseout="returnVisibility"
              @image-loaded="addSizeClasses(null)"
              @switch-img-in-project="(id: string) => onImageChange(id)"
            />
          </li>
        </ul>
      </template>
    </div>
  </div>

  <Terminal
    ref="terminal"
    :intro-typed="introTyped"
    :projects="projects.items"
    @scroll-to-project="scrollToProjectById"
    @open-index="openIndexList"
  >
    <template #content>
      <nav v-if="!indexListOpened && !introTyped" id="generic-text" class="terminal__content">
        <div id="name" data-toBeTyped="notreallycorrect." class="font-bold"></div>
        <div data-toBeTyped="  "></div>
        <div id="about-link" data-toBeTyped="about" class="cursor-pointer"></div>
        <div data-toBeTyped=" | "></div>
        <div id="index-toggle" data-toBeTyped="index" class="cursor-pointer"></div>
        <div data-toBeTyped=" | "></div>
        <a href="mailto:adam.zajacek@gmail.com" data-toBeTyped="email " class="terminal__link"></a>
        <div data-toBeTyped=" | "></div>
        <a href="https://instagram.com" data-toBeTyped="ig"  class="terminal__link"></a>
      </nav>
      <div v-else-if="!indexListOpened" id="terminal"></div>
    </template>
  </Terminal>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import axios from "axios";
// @ts-ignore
import typer from "typer-js";
// @ts-ignore
import Project from "@/components/Project";
// @ts-ignore
import Terminal from "@/components/Terminal";

import _find from "lodash/find";
import _filter from "lodash/filter";
import _forEach from "lodash/forEach";
import _orderBy from "lodash/orderBy";

import { randomMarginsLeft, randomMarginsTop, scrollElementIntoView, createController, processMessage, setImageOrientation, API_PROJECTS } from './utils';

const introTyped = ref(false);
const container = ref(null);
const indexListOpened = ref(false);
const isScrolling = ref();
const projects = ref<any>([]);
const projectsLocal = ref();
const scrolling = ref(false);
const elementsToType = ref();
const SPEED = { min: 30, max: 50 };
const chunkSizes = [2, 4, 3];


const onImageChange = (id: string) => {
  addSizeClasses(id, true);
  addSizeClasses(id);
}

const imageLoaded = (id: string) => {
  addSizeClasses(id);
  setMarginsRandomly();
}

const overProject = (id: string, message: string) => {
  if (!scrolling.value && !isPhone()) {
    addSizeClasses(id, true);
    introTyped.value && handleHover(message, 50, 30);
  } else if (!scrolling.value && isPhone()) {
    introTyped.value && handleHover(message, 50, 30);
  }
};

const openIndexList = () => {
  indexListOpened.value = true;
};

const scrollToProjectById = (id: string) => {
  returnVisibility();
  const item = document.getElementById(id);
  if (item) {
    const imageId = item.querySelector('img')?.id || null;
    addSizeClasses(imageId, true);
    if (isPhone()) {
      item.scrollIntoView({ behavior: 'smooth'});
    } else {
      scrollElementIntoView(item);
    }
  }
};

const returnVisibility = () => {
  const gridItems = document.querySelectorAll(".project");

  gridItems.forEach((item) => {
    item.classList.remove("active-project--horizontal");
    item.classList.remove("active-project--vertical");
    item.classList.remove("active-project--square");
  });

  addSizeClasses(null);
};

const getChunkedProjects = async () => {
  const localProjects = await projects.value.items;
  const chunkedArray = [];

  let currentIndex = 0;
  while (currentIndex < localProjects.length) {
    for (let size of chunkSizes) {
      if (currentIndex >= localProjects.length) break;

      const chunk = localProjects.slice(currentIndex, currentIndex + size);
      chunkedArray.push(chunk);

      currentIndex += size;
    }
  }
  projectsLocal.value = chunkedArray;
};

const onScroll = () => {
  window.clearTimeout(isScrolling.value);
  scrolling.value = true;

  isScrolling.value = setTimeout(() => {
    scrolling.value = false;
  });
};

const isPhone = () => window.matchMedia("only screen and (max-width: 768px)").matches;

const getProjects = async () => await axios
  .get(API_PROJECTS)
  .then((response) => {
    return response.data;
  });

const handleHover = async (message: string, typeTimeout = 100, removeTimeout = 90) => {
  if (introTyped.value) {
    closeIndex();
    const signal = createController();

    try {
      if (document?.querySelector("#terminal")?.innerHTML) {
        await processMessage(
          document?.querySelector("#terminal")?.innerHTML || '',
          removeTimeout,
          signal,
          true,
        );
      }
      await processMessage(message, typeTimeout, signal);
    } catch (error: any) {
      if (error?.message !== "Aborted") {
        console.error(error);
      }
    }
  }
};

const addSizeClasses = (id: string | null, isActive = false) => {
  if (id) {
    const image = document.getElementById(id);
    const parentElement = image?.closest('li');
    if (image && parentElement) {
      image?.addEventListener("load", function () {
        setImageOrientation(image as HTMLImageElement, parentElement, isActive);
      });
    }
    /* @ts-ignore */
    if (image?.complete && parentElement) {
      setImageOrientation(image as HTMLImageElement, parentElement, isActive);
    }
  }
   else {
    const gridItems = document.querySelectorAll(".project");
    gridItems.forEach((item) => {
      const image = item.querySelector("img");

      image?.addEventListener("load", function () {
        setImageOrientation(image, item, isActive);
      });

      if (image?.complete) {
        setImageOrientation(image, item, isActive);
      }
    });
  }
};

const setMarginsRandomly = () => {
  const gridItems = document.querySelectorAll(".project");

  gridItems.forEach((item: any, index: number) => {
      const marginTop = `${randomMarginsTop[index]}%`;
      const marginLeft = `${randomMarginsLeft[index + 1]}%`;

      item.style.marginTop = marginTop;
      item.style.marginLeft = marginLeft;
  });
}

const typeGreetingWithCallback = (cb: () => void) => {
  typer("#generic-text", SPEED)
    .line("Hey there!")
    .pause(500)
    .back("all", 40)
    .line("Exploring the beauty that others have condemned.")
    .pause(300)
    .back("all", 40)
    .run(cb);
}

const typeRecursive = (i = 0) => {
  if (i === elementsToType.value.length) {
    setTimeout(() => {
      introTyped.value = true;
    }, 900);
    return;
  }

  const typerino = typer(elementsToType.value[i], SPEED);
  const toBeTyped = elementsToType.value[i].getAttribute("data-toBeTyped");

  typerino.line(toBeTyped);

  setTimeout(() => {
    typeRecursive(i + 1);
  }, 75 * toBeTyped.length);
}

const typeGreeting = () => {
  elementsToType.value = document.querySelectorAll("nav > *");
  typeGreetingWithCallback(() => {
    typeRecursive();
  });
}

const fetchProjects = async () => {
  projects.value = await getProjects();
  console.log(projects.value.items)
  projects.value.items = _orderBy(
    projects.value.items,
    (item) => item.sys.createdAt,
  );

  if (!isPhone()) {
    getChunkedProjects();
  } else {
    projectsLocal.value = await projects.value.items;
  }
}

const closeIndex = () => {
  indexListOpened.value = false;
}

onMounted(() => {
  fetchProjects()
  typeGreeting();
});

</script>

<style lang="scss">
body {
  overflow: scroll;
  width: 100%;
  height: 100%;
  cursor: grab;
  background: black;
  font-family: "Fira Code", monospace;
  font-size: 15px;
}

img {
  max-width: 100%;
  height: auto;
  object-fit: contain;
}

.terminal__content {
  display: flex;
}

.terminal__link {
  color: white;
  font-weight: normal;
}

#app {
  width: 100%;
  height: 100%;
  background: black;
}

.grid-container {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: repeat(6, 60vh);
  grid-template-rows: repeat(6, 70vh);
  gap: 10%;
  position: relative;
}

.project--horizontal {
  max-width: 25vw;
  min-width: 25vw;
}

.project--vertical {
  min-width: 15vw;
  max-width: 15vw;
}

.project--square {
  max-width: 20vw;
  min-width: 20vw;
}

.project {
  overflow: hidden;
  width: 100%;
  list-style-type: none;
  margin: 1%;
  transition: all 1500ms ease-in-out 0s;
}

.font-bold {
  font-weight: bold;
}

.cursor-pointer {
  cursor: pointer;
}

.scroll-container {
  display: inline-block;
}

.start-transition {
  transform: scale(1.2);
  transition: all 1s ease-out;
}

.in-view {
  animation: pulseAnimation 5s infinite ease-in-out;
}

.transition--active {
  transition: all 1s ease-out 0s;
}

@keyframes pulseAnimation {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  0% {
    transform: scale(1);
  }
}
.flex {
  display: flex;
}

.wrapper {
  width: 100%;
  height: 100%;
  padding: 30%;
}

.list {
  display: inline-flex;
  position: relative;
  width: 100%;
  min-width: fit-content;
}

.list-phone {
  position: relative;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: fit-content;
}

.active-project--vertical {
  min-width: 30vw;
}

.active-project--horizontal {
  min-width: 45vw;
}

.active-project--square {
  min-width: 45vw;
}

.container {
  width: max-content;
  padding: 30%;
}

@media only screen and (max-width: 768px) {
  .container {
    width: 100%;
    padding: 10%;
    display: inline;
  }

  .scroll-container {
    padding: 10%;
  }
  .project--horizontal {
    max-width: 100%;
    min-width: 100%;
    width: 100%;
    margin: 0;
    padding: 0;
    margin-bottom: 10%;
  }

  .project--vertical {
    max-width: 100%;
    min-width: 100%;
    width: 100%;
    margin: 0;
    padding: 0;
    margin-bottom: 10%;
  }

  .project--square {
    max-width: 100%;
    min-width: 100%;
    width: 100%;
    margin: 0;
    padding: 0;
    margin-bottom: 10%;
  }

  .project:last-of-type {
    margin-bottom: 30%;
  }
}
</style>
