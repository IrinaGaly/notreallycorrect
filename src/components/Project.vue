<template>
  <!-- <img v-if="onClick" ref="mainImg" class="project__image" v-lazy="`${getImageUrl(project.fields.images[0])}`"
        @lazy="onImageLazyLoad(project.fields.images[0])" @mouseover="hoverOver" @mouseleave="onMouseleave" @click="clickImage" /> -->

  <div class="flex-container">
    <template
      v-for="(image, index) in project?.fields?.images"
      :key="index"
      v-lazy="`${getImageUrl(project?.fields?.images?.[0])}`"
      @mouseleave="leaveImage"
      @lazy="onImageLazyLoad(project.fields.images[index])"
    >
      <img
        v-if="index === currentIndex"
        class="image"
        :class="{ cursor: project?.fields?.images.length > 1 }"
        v-lazy="`${getImageUrl(project.fields.images[currentIndex])}`"
        @lazy="onImageLazyLoad(project.fields.images[currentIndex])"
        @mouseover="hoverOver(image)"
        @mouseleave="onMouseleave"
        @click="clickImage(image)"
      />
    </template>
    <span v-if="hovered" class="project__title">{{ mainDescription }}</span>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";

interface Image {
  src: string;
  alt: string;
  style?: object;
}

const props = defineProps<{ project: any; asset: any }>();
const onClick = ref(true);
const mainImg = ref<HTMLElement>();
const hoveredImage = ref<number | null>(null);
const hovered = ref(false);
const mainDescription = ref<string>("");
const emit = defineEmits([
  "open-project",
  "hover-over",
  "hover-out",
  "on-hover",
  "mouseout",
  "image-loaded",
  "switch-img-in-project",
]);
const currentIndex = ref<number>(0);

const hoverOver = (image: Image) => {
  hovered.value = true;
  const description = getImageDescription(image);
  mainDescription.value = description;
  emit("hover-over", getImageDescription(image));
  // console.log(`Mouse X: ${event.clientX}, Mouse Y: ${event.clientY}`);
};

const onMouseleave = (event: any) => {
  hovered.value = false;
  emit("mouseout");
};
const hoverImage = (event: any) => {
  emit("on-hover");
};

const clickImage = (image: any) => {
  // Increment the index and use modulo to wrap around to the start
  currentIndex.value =
    (currentIndex.value + 1) % props.project.fields.images.length;

  emit("switch-img-in-project");
};

const leaveImage = () => {
  hoveredImage.value = null;
};

const getImageUrl = (image: any) =>
  props.asset?.find((asset: any) => asset.sys.id === image?.sys?.id)?.fields
    ?.file?.url ?? image;

const getImageDescription = (image: any) =>
  props.asset?.find((asset: any) => asset.sys.id === image?.sys?.id)?.fields
    ?.title ?? "";

const onImageLazyLoad = (image: any) => {
  console.log(image, "lazy");
  emit("image-loaded");
};

onMounted(() => {
  //console.log(props.project, 'project')
  emit("image-loaded");
});
</script>

<style lang="scss">
#container {
  width: 100%;
  height: 100%;
  overflow: auto;
  position: relative;
}
.scroll-container {
  width: 100vw;
  height: 100vh;
  overflow: scroll;
  display: flex;
  justify-content: center;
  align-items: center;
}

.scroll-content {
  position: relative;
  width: 200vw;
  height: 200vh;
}

.flex-container {
  display: flex;
  flex-direction: column;
  height: fit-content;
  width: 100%;
}

.image-wrapper {
  /* position: absolute;
  width: 100px;
  height: 100px;
  transition: transform 0.3s ease-in-out; */
  width: 100%;
  height: 100%;
}

.image {
  position: relative;
  transition: all 1500ms ease-in-out 0s;
}

.project__image {
  &:hover {
    cursor: pointer;
  }
}

// img {
//   width: 100%;
//   height: 100%;
//   object-fit: cover;
//   position: relative;
// }

// img.hovered {
//   transform: scale(3);
//   z-index: 10;
// }

.project__title {
  // position: absolute;
  // bottom: 0;
  // left: 0;
  color: white;
  animation: showup 7s infinite;
}

@keyframes showup {
  0% {
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  80% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

.cursor {
  cursor: pointer;
}
</style>

<!-- 

<template>
  <div v-dragscroll class="main">
    <div class="scroll-container">
      <div v-for="(project, index) in projects.items" :key="index" class="project" :style="index > 0 && calculatePosition(index)">
        <HelloWorld :project="project" :asset="projects.includes.Asset" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import HelloWorld from './components/HelloWorld.vue';

const spaceId = '0r2vua7pt9sl';
const accessToken = 'G6fwMG2PqGK3z-C50t123AltfdwG5Sgc6a8B9FUQHmw';
const contentTypeId = 'projects';

const getProjects = async () => {
  return await axios.get(`https://cdn.contentful.com/spaces/${spaceId}/entries?content_type=${contentTypeId}&access_token=${accessToken}`)
    .then(response => {
      return response.data;
    });
};

const projects = ref<any>([]);

  const calculatePosition = (index) => {
      const top = index * 50 + '%'; // Adjust the multiplier as per your requirement
      const left = index * 70 + '%'; // Adjust the multiplier as per your requirement
      return {
        top,
        left,
      };
    };

onMounted(async () => {
  projects.value = await getProjects();
});
</script>

<style lang="scss">
@import './sass/main.scss';

body {
    overflow: scroll;
    width: 100%;
    height: 100%;
    cursor: grab;
}

.main {
  overflow: auto;
  width: 100%;
  height: 100%;
}

  /* .container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    position: relative;
    cursor: grab;
  } */

  /* .image-container {
    position: relative;
    width: 100%;
    transition: transform 0.2s ease-in-out;
  } */

  /* .image-container:hover {
    transform: translate(
      calc((random() - 0.5) * 20px),
      calc((random() - 0.5) * 20px)
    );
  } */

  /* @keyframes float {
    0% {
      transform: translate(0, 0);
    }
    50% {
      transform: translate(
        calc((random() - 0.5) * 20px),
        calc((random() - 0.5) * 20px)
      );
    }
    100% {
      transform: translate(0, 0);
    }
  } */

  /* .floating {
    animation: float 4s infinite ease-in-out;
  } */

//   .draggable-container {
//   width: fit-content;
//   height: fit-content;
//   position: relative;
//   cursor: grab;
// }

// .draggable-container:active {
//   cursor: grabbing;
// }

// .container {
//   width: 200%;
//   height: 200%;
//   user-select: none; /* Prevents text selection while dragging */
// }

// .image-container {
//   width: calc(25% - 20px); /* Adjust width as needed */
//   transition: transform 0.2s ease-in-out;
// }

// #app {
//   max-width: 100%!important;
//   margin: 0;
// }
img {
      max-width: 50vw;
      max-height: 50vh;
      width: auto;
      height: auto;
      display: block;
      margin: auto;
  }

  .project {
    position: absolute;
    margin: 20px;
    top: 30%;
    left: 10%;
  }

</style> -->
