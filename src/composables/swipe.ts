import { onMounted, onUnmounted, Ref } from "vue";
import Hammer from "hammerjs";

export function useSwipe(
  elementRef: Ref<any | null>,
  callbacks: {
    onSwipeUp: () => void;
    onSwipeDown: () => void;
  }
) {
  onMounted(() => {
    if (elementRef.value) {
      const hammer = new Hammer(elementRef.value);

      hammer.get("swipe").set({ direction: Hammer.DIRECTION_VERTICAL });

      hammer.on("swipeup", callbacks.onSwipeUp);
      hammer.on("swipedown", callbacks.onSwipeDown);

      elementRef.value._hammer = hammer;
    }
  });

  onUnmounted(() => {
    if (elementRef.value && elementRef.value._hammer) {
      elementRef.value._hammer.destroy();
    }
  });
}
