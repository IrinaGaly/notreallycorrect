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
        const target = entry.target as HTMLElement;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const scrollLeft = Math.round(html.scrollLeft);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
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

  const startObserving = (item: any) => {
    observer.observe(item);
  };

  // Function to stop observing an item
  const stopObserving = (item: any) => {
    observer.unobserve(item);
  };

  // Attach event listeners to each grid item
  gridItems.forEach((item) => {
    startObserving(item);

    // Mouseover event to stop observing hovered item
    item.addEventListener("mousemove", () => {
      stopObserving(item);
    });
    item.addEventListener("mouseover", () => {
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

const scrollElementIntoView = async (element: HTMLElement) => {
  // Get the scroll container and its dimensions
  // Get the scroll container
  const scrollContainer = document.getElementById("scrollContainer");

  // Get dimensions and positions
  const containerRect = scrollContainer.getBoundingClientRect();
  const targetRect = element.getBoundingClientRect();

  // Calculate offsets for padding and border
  const containerPaddingLeft = parseInt(
    getComputedStyle(scrollContainer).paddingLeft
  );
  const containerPaddingTop = parseInt(
    getComputedStyle(scrollContainer).paddingTop
  );
  const containerBorderLeft = parseInt(
    getComputedStyle(scrollContainer).borderLeftWidth
  );
  const containerBorderTop = parseInt(
    getComputedStyle(scrollContainer).borderTopWidth
  );

  // Calculate cumulative offsets for nested scrollable containers
  let cumulativeOffsetLeft = 0;
  let cumulativeOffsetTop = 0;
  let currentContainer = scrollContainer;

  while (currentContainer && currentContainer !== document.body) {
    cumulativeOffsetLeft +=
      currentContainer.scrollLeft + currentContainer.clientLeft;
    cumulativeOffsetTop +=
      currentContainer.scrollTop + currentContainer.clientTop;
    currentContainer = currentContainer.offsetParent;
  }

  // Calculate scroll positions
  const scrollLeft =
    targetRect.left -
    containerRect.left -
    (containerRect.width - targetRect.width) / 2 -
    containerPaddingLeft -
    containerBorderLeft -
    cumulativeOffsetLeft;
  const scrollTop =
    targetRect.top -
    containerRect.top -
    (containerRect.height - targetRect.height) / 2 -
    containerPaddingTop -
    containerBorderTop -
    cumulativeOffsetTop;

  // Scroll to the calculated positions
  await scrollContainer.scrollTo({
    top: scrollTop,
    left: scrollLeft,
    behavior: "auto", // Adjust behavior as needed ('auto', 'instant', or 'smooth')
  });

  //or
  // const scrollContainer = document.getElementById('scrollContainer');
  // const containerRect = scrollContainer.getBoundingClientRect();

  // // Get the target element and its dimensions
  // const targetRect = element.getBoundingClientRect();

  // // Calculate the scroll positions to center the element
  // const scrollLeft = targetRect.left - containerRect.left - (containerRect.width - targetRect.width) / 2;
  // const scrollTop = targetRect.top - containerRect.top - (containerRect.height - targetRect.height) / 2;

  // // Apply the scroll positions
  // scrollContainer.scrollTo({
  //     top: scrollTop,
  //     left: scrollLeft,
  //     behavior: 'smooth'
  // });
};

const getGlobalIndex = (groupIndex: number, indexInGroup: number) => {
  let globalIndex = 0;

  for (let i = 0; i < groupIndex; i++) {
    globalIndex += chunkSizes[i];
  }
  globalIndex += indexInGroup;

  return globalIndex;
};
