<template>
  <div class="flex-container">
    <template
      v-for="(image, index) in project?.fields?.images"
      :key="image.sys.id"
      @mouseleave="leaveImage"
    >
    <Transition name="fade" mode="out-in" class="image">
        <img
          v-if="index === currentIndex"
          :id="image.sys.id"
          :class="{ cursor: project.fields.images?.length > 1 }"
          v-lazy="`${getImageUrl(project.fields.images[currentIndex])}`"
          @mouseover="hoverOver(image)"
          @mouseleave="onMouseleave"
          @click="clickImage(image)"
        />
        </Transition>
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
  sys: {
    id: string;
  }
}

const props = defineProps<{ project: any; asset: any }>();
const hovered = ref(false);
const mainDescription = ref<string>("");
const emit = defineEmits([
  'open-project',
  'hover-over',
  'hover-out',
  'on-hover',
  'mouseout',
  'image-loaded',
  'switch-img-in-project',
]);
const currentIndex = ref<number>(0);

const hoverOver = (image: Image) => {
  hovered.value = true;
  const description = getImageDescription(image);
  mainDescription.value = description;
  emit('hover-over', image?.sys?.id, getImageDescription(image));
};

const onMouseleave = () => {
  hovered.value = false;
  emit('mouseout');
};

const clickImage = (image: Image) => {
  currentIndex.value = (currentIndex.value + 1) % props.project.fields.images.length;
  emit('switch-img-in-project', image?.sys?.id || '');
};

const getImageUrl = (image: Image) =>
  props.asset?.find((asset: any) => asset.sys.id === image?.sys?.id)?.fields
    ?.file?.url || image;

const getImageDescription = (image: Image) =>
  props.asset?.find((asset: any) => asset.sys.id === image?.sys?.id)?.fields
    ?.title || '';

onMounted(() => {
  emit('image-loaded', null);
});
</script>

<style lang="scss">
 .fade-enter-active, .fade-leave-active {
    animation: fadeAnimation 0.9s;
  }
  .fade-leave-active {
    display: none;
  }
  @keyframes fadeAnimation {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
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
