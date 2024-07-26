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
          v-lazy="`${getImageUrl(project.fields.images[currentIndex])}`"
          @mouseover="hoverOver(image)"
          @mouseleave="onMouseleave"
          @click="clickImage(image)"
        />
      </Transition>
    </template>
    <div class="project__title"><span v-if="hovered">{{ mainDescription }}</span></div>
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

const props = defineProps<{ project: any; asset: any }>();
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
  if (!props.project.fields.isDead) {
    hovered.value = true;
    const description = getImageDescription(image);
    mainDescription.value = description;
    emit("hover-over", image?.sys?.id, getImageDescription(image));
  }
};

const onMouseleave = () => {
  hovered.value = false;
  emit("mouseout");
};

const clickImage = (image: Image) => {
  currentIndex.value =
    (currentIndex.value + 1) % props.project.fields.images.length;
  emit("switch-img-in-project", image?.sys?.id || "");
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
