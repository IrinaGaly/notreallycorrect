<template>
  <div
    class="terminal fixed text-l z-30 flex text-sm flex-row items-center bottom-0 left-0"
  >
    <div v-if="introTyped" class="terminal__outdated">
      <div id="name" class="terminal-item">notreallycorrect.</div>
      <div data-toBeTyped="  "></div>
      <div id="about-link" data-toBeTyped="about" class="cursor-pointer">
        about 
      </div>
      <div data-toBeTyped=" | ">|</div>
      <a
        id="index-toggle"
        data-toBeTyped="index"
        class="cursor-pointer"
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
    <div
      class="terminal__container"
    >
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

      <div class="terminal-cursor">&nbsp;</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{ introTyped: boolean; projects: any }>();
const indexListOpened = ref(false);
const emit = defineEmits(["open-index", "scroll-to-project"]);

const indexList = () => {
  indexListOpened.value = true;
  emit('open-index');
};

const goToProject = (project: any) => {
  emit('scroll-to-project', project.sys.id);
};
</script>

<style scoped lang="scss">
.terminal {
  min-height: 2rem;
  color: whitesmoke;
  background-color: #0000ff;
  position: fixed;
  bottom: 0;
  left: 0;
  margin: 2rem;
  width: fit-content;
  padding: 0.4rem 1rem;
}

.terminal__outdated {
  position: absolute;
  top: -2rem;
  left: 0;
  color: white;
  background-color: transparent;
  display: flex;
  transition: all 1s ease-out 0s;
}

.terminal__item {
  display: flex;
  justify-content: space-between;
  .terminal__item--title {
    flex: 1;
    text-align: left;
    margin-right: 6rem;
  }
  .terminal__item--year {
    flex-shrink: 0;
    text-align: right;
    white-space: nowrap; 
  }
  &:hover {
    cursor: pointer;
  }
}

.terminal__container {
  display: flex;
  height: 100%;
  min-width: fit-content;
  width: 100%;
  justify-content: center;
  align-items: flex-end;

  .terminal__list {
    display: flex;
    flex-direction: column;
    list-style: none;
    margin: 0;
    padding: 0;

    li {
      text-decoration: none;
      white-space: nowrap;
    }
  }
}

.terminal__container--intro {
  display: flex;
  height: 100%;
  min-width: fit-content;
  width: 100%;
  justify-content: center;
  align-items: flex-end;
  padding: 5%;

  .terminal__list {
    display: flex;
    flex-direction: column;
    margin-left: 20px;

    li {
      text-decoration: none;
      white-space: nowrap;
    }
  }
}

.terminal-cursor {
  width: 0.5rem;
  height: 0.9rem;
  background-color: whitesmoke;
  margin-left: 0.5rem;
  margin-bottom: 0.3rem;
  animation: blink 1s linear infinite;
}


.terminal-item {
  font-weight: bold;
}

@keyframes blink {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}

a {
  text-decoration: none;
  color: whitesmoke;
}
</style>
