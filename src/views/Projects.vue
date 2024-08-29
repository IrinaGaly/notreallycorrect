<template>
  <div
    id="scrollContainer"
    ref="swipeArea"
    :class="['scroll-container', { 'non-scroll-container': isIPad() }]"
    v-dragscroll
    @scroll="onScroll"
    @mousedown="startDrag"
    @mouseup="endDrag"
  >
    <div
      v-if="shouldShowSurprise"
      class="projects__background"
      :style="backgroundImage"
    ></div>
    <div :class="[isPhone() ? 'project-container' : 'container']">
      <template v-if="!isPhone()">
        <ul
          v-for="(group, groupIndex) in projectsLocal"
          :key="groupIndex"
          ref="container"
          class="project__list"
        >
          <li
            v-for="(project, index) in group"
            :key="`project-${index}`"
            :id="project.sys.id"
            class="project"
          >
            <Project
              :project="project"
              :asset="projects.includes.Asset"
              @hover-over="
                (id: string, message: string) =>
                  overProject(
                    project.sys.id,
                    id,
                    message,
                    project.fields.isDead,
                  )
              "
              @mouseout="returnVisibility"
              @image-loaded="(id: string) => imageLoaded(id)"
              @switch-img-in-project="(id: string) => onImageChange(id)"
              @switch-img-in-project-ipad="(id: string) => onImageChange(id)"
            />
          </li>
        </ul>
      </template>
      <template v-else>
        <ul class="project__list--phone">
          <li
            v-for="(project, index) in projectsLocal"
            :key="`project-${index}`"
            :ref="`element-${index}`"
            :id="project.sys.id"
            :class="index === currentIndex ? 'current' : 'random'"
            :style="index !== currentIndex ? updatedStyles[index] : {}"
            class="project"
          >
            <Project
              :project="project"
              :asset="projects.includes.Asset"
              :is-phone="true"
              :is-current="index === currentIndex"
              @hover-over="
                (id: string, message: string) =>
                  overProject(
                    project.sys.id,
                    id,
                    message,
                    project.fields.isDead,
                  )
              "
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
    :scrolling="scrolling"
    @scroll-to-project="scrollTo"
    @open-index="openIndexList"
  >
    <template #content>
      <div
        v-if="!isIndexListOpen && !introTyped"
        id="generic-text"
        class="terminal__content"
      >
        <nav id="generic-text" class="terminal__content no-wrap">
          <div
            id="name"
            data-toBeTyped="notreallycorrect."
            class="font-bold"
          ></div>
          <div data-toBeTyped=" "></div>
          <div
            id="about-link"
            data-toBeTyped="about"
            class="cursor-pointer"
          ></div>
          <div data-toBeTyped=" | "></div>
          <div
            id="index-toggle"
            data-toBeTyped="index"
            class="cursor-pointer"
          ></div>
          <div data-toBeTyped=" | "></div>
          <a
            href="mailto:adam.zajacek@gmail.com"
            data-toBeTyped="e-mail"
            class="terminal__link"
          ></a>
        </nav>
      </div>
      <div v-else-if="!isIndexListOpen" id="terminal"></div>
    </template>
  </Terminal>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, computed } from "vue";
import axios from "axios";
// @ts-ignore
import typer from "typer-js";
// @ts-ignore
import Project from "@/components/Project";
// @ts-ignore
import Terminal from "@/components/Terminal";
import { useSwipe } from "./../composables/swipe";
import { useGrabCursor } from "./../composables/grabCursor";

import _find from "lodash/find";
import _filter from "lodash/filter";
import _forEach from "lodash/forEach";
import _orderBy from "lodash/orderBy";
import _findIndex from "lodash/findIndex";
import _shuffle from "lodash/shuffle";

import {
  randomMarginsLeft,
  randomMarginsTop,
  scrollElementIntoView,
  createController,
  processMessage,
  setImageOrientation,
  API_PROJECTS,
  API_PROJECTS_SURPRISE,
  removeActiveClasses,
  chunkSizes,
  handleScrollInTerminal,
} from "./utils";

export interface TerminalType {
  closeIndexList: () => void;
  setIndex: (projectId: string) => void;
}

const introTyped = ref(false);
const container = ref(null);
const isIndexListOpen = ref(false);
const projects = ref<any>([]);
const projectsLocal = ref();
const scrolling = ref(false);
const dragging = ref(false);
const elementsToType = ref();
const greetingSpeed = ref({ min: 10, max: 11 });
const terminal = ref<TerminalType | null>(null);
const swipeArea = ref<HTMLElement | null>(null);
const isOnSwipeDown = ref<null | boolean>(null);
const currentIndex = ref(0);
const previousIndex = ref<null | number>(null);
const initialPositions = ref<any>({});
const topPositions = ref<any>({});
const bottomPositions = ref<any>({});
const backgroundImage = ref<any>({});
const surprise = ref<any>({});
const shouldShowSurprise = ref<boolean>(false);
const intervalId = ref<any>(null);
const welcomeText = ref<string[]>([]);
const middleProject = ref<any>({});
let timeoutId: NodeJS.Timeout | null = null;

const handleClickOutside = (event: MouseEvent) => {
  if (
    event.target instanceof Element &&
    !event.target.classList.contains("terminal__outdated") &&
    !event.target.classList.contains("terminal__list") &&
    !event.target.classList.contains("terminal__item") &&
    !event.target.classList.contains("terminal__item--title") &&
    !event.target.classList.contains("terminal__item--year") &&
    !event.target.classList.contains("index-toggle")
  ) {
    terminal?.value?.closeIndexList();
  }
};

const onImageChange = (id: string) => {
  if (isIPad()) {
    returnVisibility();
  }
  addSizeClasses(id, true);
  addSizeClasses(id);
};

const imageLoaded = (id: string) => {
  addSizeClasses(id);
  setMarginsRandomly();
};

const overProject = (
  projectId: string,
  id: string,
  message: string,
  isDead: boolean,
) => {
  terminal?.value?.setIndex(projectId);

  if (!isDead) {
    if (!scrolling.value && !isPhone()) {
      addSizeClasses(id, true);
      introTyped.value &&
        handleHover(
          message,
          greetingSpeed.value.max ?? 10,
          greetingSpeed.value.min ?? 11,
        );
    } else if (!scrolling.value && isPhone()) {
      introTyped.value &&
        handleHover(
          message,
          greetingSpeed.value.max ?? 10,
          greetingSpeed.value.min ?? 11,
        );
    }
  }
};

const gify = () => {
  backgroundImage.value = {
    backgroundImage: `url(${surprise.value.gifyUrl})`,
  };

  setTimeout(
    () => (shouldShowSurprise.value = true),
    surprise.value.appearInSeconds * 1000,
  );
  setTimeout(
    () => (shouldShowSurprise.value = false),
    surprise.value.appearInSeconds * 1000 +
      surprise.value.disappearInSeconds * 1000,
  );
};

const openIndexList = () => {
  isIndexListOpen.value = true;
};

const scrollToProjectById = (id: string) => {
  returnVisibility();
  const item = document.getElementById(id);
  if (item) {
    const imageId = item.querySelector("img")?.id || null;
    addSizeClasses(imageId, true);
    if (isPhone()) {
      currentIndex.value = _findIndex(
        projectsLocal.value,
        (project: any) => project?.sys?.id === id,
      );
    } else {
      scrollElementIntoView(item);
    }
  }
};

const scrollToProjectInitial = (id: string) => {
  returnVisibility();
  const item = document.getElementById(id);
  if (item) {
    scrollElementIntoView(item);
  }
};

const scrollTo = (id: string) => {
  if (timeoutId) {
    clearTimeout(timeoutId);
  }

  if (isPhone()) {
    scrollToProjectById(id);
  } else {
    scrollToProjectById(id);
    timeoutId = setTimeout(() => {
      scrollToProjectById(id);
      timeoutId = null;
    }, 1000);
  }
};

const returnVisibility = () => {
  if (!scrolling.value && !dragging.value) {
    const gridItems = document.querySelectorAll(".project");

    gridItems.forEach((item) => {
      removeActiveClasses(item);
    });

    addSizeClasses(null);
  }
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

const startDrag = () => {
  dragging.value = true;
};

const endDrag = () => {
  dragging.value = false;
};

const onScroll = () => {
  scrolling.value = true;
  setTimeout(() => {
    scrolling.value = false;
    dragging.value = false;
  });
};

const isPhone = () =>
  window.matchMedia("only screen and (max-width: 668px)").matches;

const isIPad = () =>
  window.matchMedia("only screen and (max-width: 1366px)").matches &&
  window.matchMedia("only screen and (min-width: 668px)").matches;

const getProjects = async () =>
  await axios.get(API_PROJECTS).then((response) => {
    return response.data;
  });

const getSurprise = async () =>
  await axios.get(API_PROJECTS_SURPRISE).then((response) => {
    return {
      gifyUrl: response.data.includes.Asset[0].fields.file.url,
      appearInSeconds: response.data.items[0].fields.appearInSeconds,
      disappearInSeconds: response.data.items[0].fields.disappearInSeconds,
    };
  });

const handleHover = async (
  message: string,
  typeTimeout = 100,
  removeTimeout = 90,
) => {
  if (introTyped.value) {
    closeIndex();
    const signal = createController();

    try {
      if (document?.querySelector("#terminal")?.innerHTML) {
        await processMessage(
          document?.querySelector("#terminal")?.innerHTML || "",
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
  if (!isPhone()) {
    if (id) {
      const image = document.getElementById(id);
      const parentElement = image?.closest("li");
      if (image && parentElement) {
        image?.addEventListener("load", function () {
          setImageOrientation(
            image as HTMLImageElement,
            parentElement,
            isActive,
          );
        });
      }
      /* @ts-ignore */
      if (image?.complete && parentElement) {
        setImageOrientation(image as HTMLImageElement, parentElement, isActive);
      }
    } else {
      const gridItems = document.querySelectorAll(".project");
      gridItems.forEach((item, index) => {
        const image = item.querySelector("img");

        image?.addEventListener("load", function () {
          setImageOrientation(image, item, isActive);
        });

        if (image?.complete) {
          setImageOrientation(image, item, isActive);
        }
      });
    }
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
};

const typeGreetingWithCallback = (cb: () => void) => {
  const typerInstance = typer("#generic-text", greetingSpeed.value);
  welcomeText.value.forEach((text) =>
    typerInstance
      .line(text)
      .pause(greetingSpeed.value.max + 300)
      .back("all", greetingSpeed.value.max),
  );
  typerInstance.run(cb);
};

const typeRecursive = (i = 0) => {
  if (i === elementsToType.value.length) {
    setTimeout(() => {
      introTyped.value = true;
    }, 900);
    return;
  }

  const typerino = typer(elementsToType.value[i], greetingSpeed.value);
  const toBeTyped = elementsToType.value[i].getAttribute("data-toBeTyped");

  typerino.line(toBeTyped);

  setTimeout(
    () => {
      typeRecursive(i + 1);
    },
    greetingSpeed.value.max + 20 * toBeTyped.length,
  );
};

const typeGreeting = () => {
  elementsToType.value = document.querySelectorAll("nav > *");
  typeGreetingWithCallback(() => {
    typeRecursive();
  });
};

const fetchProjects = async () => {
  projects.value = await getProjects();

  const orderedItems = _orderBy(
    projects.value.items,
    (item) => item.sys.createdAt,
    "desc",
  );

  const latestItem = orderedItems[0];
  const remainingItems = orderedItems.slice(1);
  const shuffledItems = _shuffle(remainingItems);

  projects.value.items = [latestItem, ...shuffledItems];
  middleProject.value =
    projects.value.items[Math.floor(projects.value.items.length - 1 / 2)];

  if (!isPhone()) {
    await getChunkedProjects();
    scrollToProjectInitial(middleProject.value.sys.id);
  } else {
    projectsLocal.value = await projects.value.items;
    calculateInitialPositions();
  }
};

const closeIndex = () => {
  isIndexListOpen.value = false;
};

const randomizePosition = (isTopHalf: boolean) => {
  const randomLeft = Math.random() * 90 - 10;
  const randomTranslateX = Math.random() * 20 - 10;
  const randomTranslateY = Math.random() * 20 - 10;

  if (isTopHalf) {
    const randomTop = Math.random() * 30 - 10;
    return {
      top: `${randomTop}%`,
      left: `${randomLeft}%`,
      transform: `translate(-${randomTranslateX}%, -${randomTranslateY}%)`,
    };
  } else {
    const randomBottom = Math.random() * 30;
    return {
      bottom: `${randomBottom}%`,
      left: `${randomLeft}%`,
      transform: `translate(-${randomTranslateX}%, -${randomTranslateY}%)`,
    };
  }
};

const calculateInitialPositions = () => {
  projectsLocal.value.forEach((_: any, index: number) => {
    initialPositions.value[index] = randomizePosition(false);
  });
};

const onSwipeUp = () => {
  if (currentIndex.value < projectsLocal.value.length - 1) {
    previousIndex.value = currentIndex.value;
    currentIndex.value++;

    if (!topPositions.value[previousIndex.value]) {
      topPositions.value[previousIndex.value] = randomizePosition(true);
    }
  }
};

const onSwipeDown = () => {
  if (currentIndex.value > 0) {
    previousIndex.value = currentIndex.value;
    currentIndex.value--;

    if (!bottomPositions.value[previousIndex.value]) {
      bottomPositions.value[previousIndex.value] = randomizePosition(false);
    }

    if (topPositions.value[currentIndex.value]) {
      delete topPositions.value[currentIndex.value];
    }
  }
};

const updatedStyles = computed(() => {
  const styles: any = {};

  projectsLocal.value.forEach((_: any, index: number) => {
    if (index === currentIndex.value) {
      return;
    } else if (topPositions.value[index]) {
      styles[index] = topPositions.value[index];
    } else if (bottomPositions.value[index]) {
      styles[index] = bottomPositions.value[index];
    } else {
      styles[index] = initialPositions.value[index];
    }
  });

  return styles;
});

const fetchSurprise = async () => {
  surprise.value = await getSurprise();
  intervalId.value = setInterval(
    gify,
    surprise.value.disappearInSeconds * 1000,
  );
};

onMounted(() => {
  if (isIPad()) {
    handleScrollInTerminal();
  }

  welcomeText.value = localStorage.getItem("welcomeText")?.split("\n") ?? [""];
  fetchProjects();
  typeGreeting();
  fetchSurprise();
  window.addEventListener("click", handleClickOutside);

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
});

useGrabCursor();

useSwipe(swipeArea, {
  onSwipeUp: () => {
    isOnSwipeDown.value = false;
    returnVisibility();
    onSwipeUp();
  },
  onSwipeDown: () => {
    isOnSwipeDown.value = true;
    returnVisibility();
    onSwipeDown();
  },
});

watch(currentIndex, (newIndex, oldIndex) => {
  previousIndex.value = oldIndex;
});
</script>
