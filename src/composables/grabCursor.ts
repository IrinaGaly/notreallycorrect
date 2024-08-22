import { onMounted, onUnmounted } from "vue";

export function useGrabCursor() {
  const handleMouseDown = () => {
    document.body.classList.add("grabbing");
  };

  const handleMouseUp = () => {
    document.body.classList.remove("grabbing");
  };

  onMounted(() => {
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);

    document.addEventListener("touchstart", handleMouseDown);
    document.addEventListener("touchend", handleMouseUp);
  });

  onUnmounted(() => {
    document.removeEventListener("mousedown", handleMouseDown);
    document.removeEventListener("mouseup", handleMouseUp);

    document.removeEventListener("touchstart", handleMouseDown);
    document.removeEventListener("touchend", handleMouseUp);
  });
}
