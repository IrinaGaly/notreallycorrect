<template>
  <div
    class="terminal"
  >
    <div v-if="introTyped" class="terminal__outdated">
      <div id="name" class="font-bold">notreallycorrect.</div>
      <div data-toBeTyped="  ">&nbsp;</div>
      <div id="about-link" data-toBeTyped="about" class="cursor-pointer" @click="goToAbout">
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
      <a href="mailto:adam.zajacek@gmail.com" data-toBeTyped="email "
        > email </a
      >
      <div data-toBeTyped=" | ">|</div>
      <a href="https://instagram.com" data-toBeTyped="ig"> ig</a>
    </div>
    <div class="terminal__container">
      <template v-if="indexListOpened">
        <ul class="terminal__list">
          <li
            v-for="project in projects"
            class="terminal__item"
            @click="goToProject(project)"
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
</template>

<script setup lang="ts">
import { ref } from "vue";
import router from '@/router'; // Adjust the import path if needed

const props = defineProps<{ introTyped: boolean; projects: any }>();
const indexListOpened = ref(false);
const emit = defineEmits(["open-index", "scroll-to-project"]);

const indexList = () => {
  toggleIdexList();
  emit("open-index");
};

const closeIndexList = () => {
  indexListOpened.value = false;
};

const toggleIdexList = () => {
  indexListOpened.value = !indexListOpened.value;
};

const goToProject = (project: any) => {
  emit("scroll-to-project", project.sys.id);
};

const goToAbout = () => {
  router.push('/about');
}

defineExpose({
  closeIndexList,
});
</script>
