<template>
  <div class="project__container">
    <template
      v-for="(image, index) in project?.fields?.images"
      :key="image.sys.id"
      @mouseleave="leaveImage"
    >
      <Transition name="fade" mode="out-in" class="image">
        <img
          v-if="index === currentIndex"
          :id="image.sys.id"
          :size="project.fields.size ?? 's'"
          :class="{ cursorPointer: project.fields.images?.length > 1 }"
          v-lazy="{
            src: `${getImageUrl(project.fields.images[currentIndex])}`,
            loaded: imageLoaded(image),
          }"
          @mouseover="hoverOver(image)"
          @mouseleave="onMouseleave"
          @click.stop.prevent="clickImage(image)"
        />
      </Transition>
    </template>
    <div class="project__title">
      <span v-if="hovered">{{ mainDescription }}</span>
    </div>
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
  };
}

interface Props {
  project: any;
  asset: any;
  isPhone?: boolean;
  isCurrent?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  project: () => {},
  asset: () => {},
  isPhone: false,
  isCurrent: false,
});

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
  "switch-img-in-project-ipad",
]);
const currentIndex = ref<number>(0);
const currentIndexIpad = ref<number>(-1);

const imageLoaded = (image: Image) => {
  if (props.isCurrent && props.isPhone) {
    hoverOver(image);
  }
};

const isIPad = () =>
  window.matchMedia("only screen and (max-width: 1366px)").matches &&
  window.matchMedia("only screen and (min-width: 668px)").matches;

const hoverOver = (image: Image) => {
  hovered.value = true;
  mainDescription.value = props.project.fields.title;
  emit("hover-over", image?.sys?.id, getImageDescription(image));
};

const onMouseleave = () => {
  hovered.value = false;
  emit("mouseout");
};

const clickImage = (image: Image) => {
  if (isIPad() && currentIndexIpad.value === -1) {
    currentIndexIpad.value += 1;
    emit("switch-img-in-project-ipad", image?.sys?.id || "");
  } else if ((props.isCurrent && props.isPhone) || !props.isPhone) {
    currentIndex.value =
      (currentIndex.value + 1) % props.project.fields.images.length;
    emit("switch-img-in-project", image?.sys?.id || "");
  }
};

const getImageUrl = (image: Image) =>
  props.asset?.find((asset: any) => asset.sys.id === image?.sys?.id)?.fields
    ?.file?.url || image;

const getImageDescription = (image: Image) =>
  props.asset?.find((asset: any) => asset.sys.id === image?.sys?.id)?.fields
    ?.title || "";

onMounted(() => {
  emit("image-loaded", null);
});
</script>
