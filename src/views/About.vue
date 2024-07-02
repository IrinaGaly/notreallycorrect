<template>
  <div
    v-dragscroll
    @scroll="onScroll"
    @mousedown="doSomethingStart"
    @mousemove="doSomethingMove"
    @mouseup="doSomethingEnd"
    class="scroll-container"
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
              @hover-over="
                (message: string) =>
                  overProject(message, getGlobalIndex(groupIndex, index))
              "
              @mouseout="returnVisibility(getGlobalIndex(groupIndex, index))"
              @image-loaded="addSizeClasses(null)"
              @switch-img-in-project="
                addActiveClass(getGlobalIndex(groupIndex, index))
              "
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
              @hover-over="(message: string) => overProject(message, index)"
              @mouseout="returnVisibility(index)"
              @image-loaded="addSizeClasses(null)"
              @switch-img-in-project="addSizeClasses(null)"
            />
          </li>
        </ul>
      </template>
      <!-- <ul ref="container" >
        <template  v-for="(project, index) in projects.items">
          <template v-if="index > 6">
            <li  :key="index" :ref="`element-${index}`" class="project">
              <Project  :project="project" :asset="projects.includes.Asset" @open-project="openProject" @hover-over="overProject(project, index)" @mouseout="returnVisibility(index)"/>
            </li>
          </template>
        </template>
      </ul> -->
    </div>
  </div>

  <Terminal
    :intro-typed="introTyped"
    :projects="projects.items"
    @scroll-to-project="scrollToProjectById"
    @open-index="openIndexList"
  >
    <template #content>
      <div v-if="!indexListOpened" id="terminal"></div>
    </template>
  </Terminal>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeMount } from "vue";
import axios from "axios";
import typer from "typer-js";
import Project from "@/components/Project";
import Terminal from "@/components/Terminal";
import router from "@/router";
import _find from "lodash/find";
import _filter from "lodash/filter";
import _forEach from "lodash/forEach";
import _orderBy from "lodash/orderBy";

const spaceId = "0r2vua7pt9sl";
const accessToken = "G6fwMG2PqGK3z-C50t123AltfdwG5Sgc6a8B9FUQHmw";
const contentTypeId = "projects";
const isDragging = ref(false);
const introTyped = ref(false);
const container = ref(null);
const indexListOpened = ref(false);
const elements = ref([]); // Your array of elements
const isScrolling = ref();
const projects = ref<any>([]);
const projectsLocal = ref();
const scrolling = ref(false);

const content = [
  "Hey there!",
  "Exploring beauty that others have condemned.",
  "NotReallyCorrect | contact | index | ig",
];

const overProject = (message: string, index: number) => {
  stopObserving();

  if (!scrolling.value && !isPhone()) {
    addActiveClass(index);
    introTyped.value && handleHover(message ?? "", 50, 50);
  } else if (!scrolling.value && isPhone()) {
    introTyped.value && handleHover(message ?? "", 50, 50);
  }
};

const openIndexList = () => {
  indexListOpened.value = true;
};

const addActiveClass = (index: number) => {
  const gridItems = document.querySelectorAll(".project");

  gridItems.forEach(async (item, itemIndex) => {
    item.classList.remove("active-project--horizontal");
      item.classList.remove("active-project--vertical");
     
    if (itemIndex === index) {
      item.classList.remove("project--horizontal");
      item.classList.remove("project--vertical");
      await addSizeClasses(item, true);
      await addSizeClasses(null);
    }
  });
};

const scrollToProjectById = (id: string) => {
  const gridItems = document.querySelectorAll(".project");

  gridItems.forEach((item, itemIndex) => {
    item.classList.remove("active-project--horizontal");
    item.classList.remove("active-project--vertical");
  });

  const item = document.getElementById(id);
  if (item) {
    addSizeClasses(item, true);
    item.scrollIntoView({ behavior: "smooth" });
  }
};

const returnVisibility = (index) => {
  const gridItems = document.querySelectorAll(".project");
  gridItems.forEach((item, itemIndex) => {
    item.classList.remove("active-project--horizontal");
    item.classList.remove("active-project--vertical");
  });
};

const chunkedProjects = async () => {
  const chunkSize = 4;
  const localProjects = await projects.value.items;
  const chunkedArray = [];
  for (let i = 0; i < localProjects.length; i += chunkSize) {
    chunkedArray.push(localProjects.slice(i, i + chunkSize));
  }
  projectsLocal.value = chunkedArray;
};

const getGlobalIndex = (groupIndex, indexInGroup) =>
  groupIndex * 4 + indexInGroup;

const projectsObserver = () => {
  const gridItems = document.querySelectorAll(".project");
  const html = document.querySelector("html");

  const observerOptions = {
    root: null, // viewport
    rootMargin: "0px",
    threshold: 0.1, // 10% of the element is visible
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        const target = entry.target;

        const scrollLeft = Math.round(html.scrollLeft);
        const scrollTop = Math.round(html.scrollTop);

        const innerWidth = Math.round(window.innerWidth);
        const innerHeight = Math.round(window.innerHeight);

        const scr_center_xy = [
          scrollLeft + innerWidth / 2,
          scrollTop + innerHeight / 2,
        ];
        const center_xy = [
          target.offsetLeft + target.offsetWidth / 2,
          target.offsetTop + target.offsetHeight / 2,
        ];
        const diff_to_center_xy = [
          scr_center_xy[0] - center_xy[0],
          scr_center_xy[1] - center_xy[1],
        ];

        const scale = 0.8 + Math.abs(entry.intersectionRatio) * 0.2;
        target.style.filter = `blur(${1 - entry.intersectionRatio}px)`;
        target.style.transform = `matrix(${scale}, 0, 0, ${scale}, ${diff_to_center_xy[0] * 0.13}, ${diff_to_center_xy[1] * 0.13})`;
      }
    });
  }, observerOptions);

  const startObserving = (item) => {
    observer.observe(item);
  };

  // Function to stop observing an item
  const stopObserving = (item) => {
    observer.unobserve(item);
  };

  // Attach event listeners to each grid item
  gridItems.forEach((item) => {
    startObserving(item);

    // Mouseover event to stop observing hovered item
    item.addEventListener("mousemove", () => {
      console.log("mousemove");
      stopObserving(item);
    });
    item.addEventListener("mouseover", () => {
      console.log("mouseover");
      stopObserving(item);
    });
  });
};

const stopObserving = () => {
  const gridItems = document.querySelectorAll(".project");
  gridItems.forEach((item) => {
    const element = item as HTMLElement;
    element?.classList.remove("transition--active");
    //element.style.transform = "none";
  });
};

const onScroll = () => {
  //projectsObserver();
  window.clearTimeout(isScrolling.value);
  scrolling.value = true;
  //removeActiveClasses();

  isScrolling.value = setTimeout(() => {
    stopObserving();
    scrolling.value = false;
    console.log("Scrolling has stopped.");
  });
};

const isPhone = () => {
  return window.matchMedia("only screen and (max-width: 768px)").matches;
};

// const openProject = (message: string) => {
//   //router.push({ name: "Projects" });
//   handleHover(message, 50, 50);
// };

const fetchElements = () => {
  elements.value = Array.from(document.querySelectorAll(".project"));
};
const getProjects = async () => {
  return await axios
    .get(
      `https://cdn.contentful.com/spaces/${spaceId}/entries?content_type=${contentTypeId}&access_token=${accessToken}`,
    )
    .then((response) => {
      return response.data;
    });
};

const doSomethingMove = (event) => {
  isDragging.value && fetchElements();
};

const doSomethingStart = () => {
  isDragging.value = true;
};

const doSomethingEnd = () => {
  isDragging.value = false;
};

const typeAndRemoveMessage = (
  message,
  typingTimeout,
  removingTimeout,
  index,
) => {
  return new Promise((resolve) => {
    // Typing text
    const typePromises = typingPromises(message, typingTimeout);
    typePromises.forEach((promise, i, arr) => {
      promise.then((portion) => {
        document.querySelector("#terminal").innerHTML = portion;
        if (i === arr.length - 1) {
          // Once typing is done, decide whether to start removing
          if (index === 2) {
            setTimeout(() => resolve(), 500); // Delay before resolving
            introTyped.value = true;
          } else {
            setTimeout(() => {
              const removePromises = removingPromises(message, removingTimeout);
              removePromises.forEach((remPromise, j, remArr) => {
                remPromise.then((remPortion) => {
                  document.querySelector("#terminal").innerHTML = remPortion;
                  if (j === remArr.length - 1) {
                    resolve(); // Resolve the promise when removal is complete
                  }
                });
              });
            }, 500); // Delay before starting removal
          }
        }
      });
    });
  });
};

const typingPromises = (message, timeout, signal = null) =>
  [...message].map(
    (ch, i) =>
      new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          resolve(message.substring(0, i + 1));
        }, timeout * i);

        signal &&
          signal.addEventListener("abort", () => {
            clearTimeout(timeoutId);
            reject(new Error("Aborted"));
          });
      }),
  );

const removingPromises = (message, timeout, signal = null) =>
  [...message].map(
    (ch, i) =>
      new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          resolve(message.substring(0, message.length - i - 1));
        }, timeout * i);

        signal &&
          signal.addEventListener("abort", () => {
            clearTimeout(timeoutId);
            reject(new Error("Aborted"));
          });
      }),
  );

let currentOperation = null;
let controller = null;

const typeMessage = (message, typingTimeout, signal = null) => {
  return new Promise((resolve, reject) => {
    const typePromises = typingPromises(message, typingTimeout, signal);
    typePromises.forEach((promise, i, arr) => {
      promise
        .then((portion) => {
          document.querySelector("#terminal").innerHTML = portion;
          if (i === arr.length - 1) {
            resolve();
          }
        })
        .catch(reject);
    });
  });
};

const removeMessage = (message, removingTimeout, signal) => {
  return new Promise((resolve, reject) => {
    const removePromises = removingPromises(message, removingTimeout, signal);
    removePromises.forEach((promise, i, arr) => {
      promise
        .then((portion) => {
          document.querySelector("#terminal").innerHTML = portion;
          if (i === arr.length - 1) {
            resolve();
          }
        })
        .catch(reject);
    });
  });
};

const handleHover = async (message, typeTimeout = 140, removeTimeout = 140) => {
  if (introTyped.value) {
    if (controller) {
      controller.abort(); // Abort the current operation
    }

    controller = new AbortController();
    const signal = controller.signal;

    try {
      if (document.querySelector("#terminal")?.innerHTML) {
        await removeMessage(
          document.querySelector("#terminal")?.innerHTML,
          removeTimeout,
          signal,
        );
      }
      await typeMessage(message, typeTimeout, signal);
    } catch (error) {
      if (error.message !== "Aborted") {
        console.error(error);
      }
    }
  }
};

const processMessages = async (messages, typingTimeout, removingTimeout) => {
  for (let i = 0; i < messages.length; i++) {
    await typeAndRemoveMessage(messages[i], typingTimeout, removingTimeout, i);
  }
};

const elementsToType = ref();

const addSizeClasses = (item: any, isActive = false) => {
  if (item) {
    const image = item.querySelector(".image");
    console.log(image, "image", image.naturalWidth, image.naturalHeight);

    image?.addEventListener("load", function () {
      setImageOrientation(image, item, isActive);
    });

    // If the image is already loaded (cached)
    if (image?.complete) {
      setImageOrientation(image, item, isActive);
    }
  } else {
    const gridItems = document.querySelectorAll(".project");
    console.log(gridItems, "item");
    gridItems.forEach((item) => {
      const image = item.querySelector("img");

      image?.addEventListener("load", function () {
        setImageOrientation(image, item, isActive);
      });

      // If the image is already loaded (cached)
      if (image?.complete) {
        setImageOrientation(image, item, isActive);
      }

      // // Ensure the image has loaded to access its natural dimensions
      //     if (image?.naturalWidth > image.naturalHeight) {
      //         // Image is horizontal
      //         image.classList.add('horizontal-image');
      //     } else {
      //         // Image is vertical
      //         image.classList.add('vertical-image');
      //     }
    });
  }
};

const setImageOrientation = (
  image: HTMLImageElement,
  item: Element,
  isActive: boolean,
) => {
  console.log(item, image, image.naturalWidth, image.naturalHeight, "nfknd");
  if (image.naturalWidth >= image.naturalHeight) {
    // Image is horizontal
    if (isActive) {
      item.classList.add("active-project--horizontal");
    } else {
      item.classList.add("project--horizontal");
    }
  } else {
    if (isActive) {
      item.classList.add("active-project--vertical");
    } else {
      item.classList.add("project--vertical");
    }
    // Image is vertical
  }
};
onMounted(async () => {
  projects.value = await getProjects();
  projects.value.items = _orderBy(
    projects.value.items,
    (item) => item.sys.updatedAt,
  );
  // projectsObserver()
  elementsToType.value = document.querySelectorAll("nav > *");
  processMessages(content, 50, 50);
  if (!isPhone()) {
    chunkedProjects();
  } else {
    projectsLocal.value = await projects.value.items;
    console.log(projectsLocal.value, "ttu");
  }
  //addSizeClasses();

  // document.addEventListener("DOMContentLoaded", function() {
  //       const items = document.querySelectorAll('.project');

  //       items.forEach(item => {
  //           item.addEventListener('mouseover', function() {
  //               item.scrollIntoView({
  //                   behavior: 'smooth',
  //                   block: 'center'
  //               });
  //           });
  //       });
  //   });
});

// window.addEventListener("scroll", () => projectsObserver());
</script>

<style lang="scss">
body {
  overflow: scroll;
  width: 100%;
  height: 100%;
  cursor: grab;
  background: black;
  font-family: "Fira Code", monospace;
}

img {
  max-width: 100%;
  height: auto;
  object-fit: contain;
}

#app {
  width: 100%;
  height: 100%;
  background: black;
}

.container {
  // width: 150%;
  // height: 100%;
  // display: flex;
  // align-items: center;
  // flex-wrap: wrap;
  // padding: 10%;
  // padding-left: 30%;
  // padding-right: 50%;
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
  min-width: 25vw;
}

.project--vertical {
  min-width: 15vw;
  //max-height: 70vh;
}

.project {
  //position: relative;
  overflow: hidden;
  //display: flex;
  //width: 15vw;
  // min-width: 15vw;
  width: 100%;
  //box-sizing: border-box;
  //max-height: 30vh;
  list-style-type: none;
  //float: left;
  margin: 5%;
  transition: all 1500ms ease-in-out 0s;

  &:hover {
    // min-width: 35vw;
    // //height: 50vh;
    // min-height: 30vh;

    // padding: 5%;
    // margin: 10%;
    // transform: scale(5);
  }
}

.scroll-container {
  padding-right: 10%;
  display: inline-block;
  padding: 10% 15%;
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
  position: relative;
  // margin: 0;
  // padding: 0;
  // display: flex;
  // width: 100%;
  // min-width: fit-content;
  display: inline-flex;
  // margin-left: 10%;
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

.list:nth-child(odd) {
  margin-right: 10%;
  .project {
    //margin: 20%;
  }
  .project:nth-child(even) {
    margin-top: 5%;
    //  &:hover {
    //   margin: 0;
    //  }
  }
  .project:nth-child(odd) {
    margin-bottom: 8%;
    margin-left: 5%;
    margin-top: 10%;

    // &:hover {
    //   margin: 0;
    //  }
  }
  .project:last-child {
    // margin-right: 25%;
    // padding-right: 10%;
  }
}

.list:nth-child(even) {
  margin-right: 10%;
  .project:nth-child(2) {
    margin-right: 15%;
    margin-top: 5%;
    // &:hover {
    //   margin: 0;
    // }
  }
  .project:nth-child(1) {
    margin-left: 15%;
    // &:hover {
    //   margin: 0;
    // }
  }
  .project:last-child {
    // tut chtoby otstub byl s
    // margin-right: 15%;
     padding-right: 10%;
    // &:hover {
    //   //margin-right: 30%;
    //  }
  }
}

// .list:last-of-type {
//   margin-bottom: 20%;
// }

.active-project--vertical {
  min-width: 25vw;
  //height: 50vh;
  //max-height: 50vh;

  // padding: 5%;
  // margin: 20%;
  padding-top: 5%;
}

.active-project--horizontal {
  min-width: 40vw;
  //height: 50vh;
  //min-height: 30vh;

  // padding: 5%;
  // margin: 20%;
  padding-top: 5%;
}

// .active-project--vertical:last-child {
//   min-width: 35vw;
// }

// .active-project--horizontal:last-child {
//   min-width: 45vw;
// }

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
    width: 100%;
    margin: 0;
    padding: 0;
    margin-bottom: 10%;
  }

  .project--vertical {
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
