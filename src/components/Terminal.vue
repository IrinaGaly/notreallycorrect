<template>
  <div class="terminal">
    <transition name="fade">
      <div v-if="introTyped" class="terminal__outdated">
        <div id="name" class="font-bold">notreallycorrect.</div>
        <div data-toBeTyped="  |">&nbsp;</div>
        <div
          id="about-link"
          data-toBeTyped="about"
          class="cursor-pointer index-toggle"
          @click="goToAbout"
        >
          about 
        </div>
        <div data-toBeTyped=" | ">|</div>
        <a
          id="index-toggle"
          data-toBeTyped="index"
          class="cursor-pointer index-toggle"
          @click="indexList"
          > index </a
        >
        <div data-toBeTyped=" | ">|</div>
        <a
          href="mailto:be@notreallycorrect.com?body=Hello%20There&body=Tvarujeme%20realitu%20do%20poh%C3%A1dek.%20Jak%20vypad%C3%A1%20ta%20Va%C5%A1e%3F"
          data-toBeTyped="e-mail"
          class="cursor-pointer index-toggle"
          > e-mail </a
        >
      </div>
    </transition>
    <div class="terminal__wrapper">
      <div class="terminal__container">
        <template v-if="isIndexListOpen">
          <ul class="terminal__list">
            <li
              v-for="(project, index) in projects"
              class="terminal__item"
              :class="{ bold: selectedIndex === index }"
              @click="goToProject(project, index)"
            >
              <span class="terminal__item--title">
                {{ project.fields.title }}
              </span>
              <span class="terminal__item--year">
                {{ project.fields.year }}
              </span>
            </li>
          </ul>
        </template>
        <slot v-else name="content"></slot>
        <div class="terminal__cursor">&nbsp;</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import router from "@/router";
import _findIndex from "lodash/findIndex";

interface Props {
  projects?: any[];
  introTyped?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  projects: () => [],
  introTyped: false,
});

const isIndexListOpen = ref(false);
const emit = defineEmits(["open-index", "scroll-to-project"]);
const selectedIndex = ref<number | null>(null);

const indexList = () => {
  toggleIdexList();
  emit("open-index");
};

const closeIndexList = () => {
  isIndexListOpen.value = false;
  selectedIndex.value = null;
};

const toggleIdexList = () => {
  isIndexListOpen.value = !isIndexListOpen.value;
};

const goToProject = (project: any, index: number) => {
  selectedIndex.value = index;
  emit("scroll-to-project", project.sys.id);
};

const goToAbout = () => {
  router.push("/about");
  selectedIndex.value = null;
};

const setIndex = (projectId: string) => {
  selectedIndex.value = _findIndex(
    props.projects,
    (project) => project.sys.id === projectId,
  );
  scrollToItem(selectedIndex.value);
};

const scrollToItem = (index: number) => {
  if (index >= 0 && index < props.projects.length) {
    const itemElement = document.querySelector(
      `.terminal__list .terminal__item:nth-child(${index + 1})`,
    );
    itemElement?.scrollIntoView({
      behavior: "instant",
      block: "nearest",
    });
  }
};

defineExpose({
  closeIndexList,
  setIndex,
});
</script>
