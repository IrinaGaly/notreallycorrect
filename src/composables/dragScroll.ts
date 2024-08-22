import { onMounted, onUnmounted, Ref } from "vue";

export function useDragScroll(elementRef: Ref<any | null>) {
  // Function to check if the device is an iPad based on screen dimensions
  function isIPad() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const pixelRatio = window.devicePixelRatio;

    // Known iPad screen dimensions (including retina displays)
    const iPadDimensions = [
      { width: 768, height: 1024 }, // iPad Mini (1st, 2nd, 3rd gen) and iPad (4th gen)
      { width: 810, height: 1080 }, // iPad (5th, 6th, 7th gen) and iPad Air (3rd gen)
      { width: 820, height: 1180 }, // iPad Air (4th gen) and iPad (9th gen)
      { width: 834, height: 1112 }, // iPad Pro (11-inch, 1st & 2nd gen)
      { width: 1024, height: 1366 }, // iPad Pro (12.9-inch, 3rd & 4th gen)
    ];

    return (
      iPadDimensions.some(
        (dim) =>
          (width === dim.width && height === dim.height) ||
          (width === dim.height && height === dim.width),
      ) && pixelRatio >= 1
    );
  }

  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let scrollLeft = 0;
  let scrollTop = 0;

  const handleMouseDown = (event: MouseEvent) => {
    event.preventDefault();
    event.stopImmediatePropagation();

    isDragging = true;
    startX = event.pageX - (elementRef.value as HTMLElement).offsetLeft;
    startY = event.pageY - (elementRef.value as HTMLElement).offsetTop;
    scrollLeft = (elementRef.value as HTMLElement).scrollLeft;
    scrollTop = (elementRef.value as HTMLElement).scrollTop;

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (!isDragging) return;

    const x = event.pageX - (elementRef.value as HTMLElement).offsetLeft;
    const y = event.pageY - (elementRef.value as HTMLElement).offsetTop;

    const walkX = (x - startX) * 2; // Scroll speed multiplier
    const walkY = (y - startY) * 2; // Scroll speed multiplier

    (elementRef.value as HTMLElement).scrollLeft = scrollLeft - walkX;
    (elementRef.value as HTMLElement).scrollTop = scrollTop - walkY;
  };

  const handleMouseUp = () => {
    isDragging = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  // Touch events
  const handleTouchStart = (event: TouchEvent) => {
    if (event.touches.length === 1) {
      isDragging = true;
      startX =
        event.touches[0].pageX - (elementRef.value as HTMLElement).offsetLeft;
      startY =
        event.touches[0].pageY - (elementRef.value as HTMLElement).offsetTop;
      scrollLeft = (elementRef.value as HTMLElement).scrollLeft;
      scrollTop = (elementRef.value as HTMLElement).scrollTop;

      document.addEventListener("touchmove", handleTouchMove);
      document.addEventListener("touchend", handleTouchEnd);
    }
  };

  const handleTouchMove = (event: TouchEvent) => {
    if (!isDragging || event.touches.length !== 1) return;

    const x =
      event.touches[0].pageX - (elementRef.value as HTMLElement).offsetLeft;
    const y =
      event.touches[0].pageY - (elementRef.value as HTMLElement).offsetTop;

    const walkX = (x - startX) * 2; // Scroll speed multiplier
    const walkY = (y - startY) * 2; // Scroll speed multiplier

    (elementRef.value as HTMLElement).scrollLeft = scrollLeft - walkX;
    (elementRef.value as HTMLElement).scrollTop = scrollTop - walkY;
  };

  const handleTouchEnd = () => {
    isDragging = false;
    document.removeEventListener("touchmove", handleTouchMove);
    document.removeEventListener("touchend", handleTouchEnd);
  };

  onMounted(() => {
    if (elementRef.value && isIPad()) {
      (elementRef.value as HTMLElement).addEventListener(
        "mousedown",
        handleMouseDown,
      );
      (elementRef.value as HTMLElement).addEventListener(
        "touchstart",
        handleTouchStart,
      );
    }
  });

  onUnmounted(() => {
    if (elementRef.value) {
      (elementRef.value as HTMLElement).removeEventListener(
        "mousedown",
        handleMouseDown,
      );
      (elementRef.value as HTMLElement).removeEventListener(
        "touchstart",
        handleTouchStart,
      );
    }
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
    document.removeEventListener("touchmove", handleTouchMove);
    document.removeEventListener("touchend", handleTouchEnd);
  });
}
