const spaceId = import.meta.env.VITE_SPACE_ID;
const accessToken = import.meta.env.VITE_API_KEY;
const contentTypeId = "projects";
const mainContentTypeId = "main";
const aboutTypeId = "aboutPaage";

export const API_PROJECTS = `https://cdn.contentful.com/spaces/${spaceId}/entries?content_type=${contentTypeId}&access_token=${accessToken}`;
export const API_MAIN = `https://cdn.contentful.com/spaces/${spaceId}/entries?content_type=${mainContentTypeId}&access_token=${accessToken}`;
export const API_ABOUT = `https://cdn.contentful.com/spaces/${spaceId}/entries?content_type=${aboutTypeId}&access_token=${accessToken}`;

export const chunkSizes = [
  2, 4, 3, 5, 3, 2, 5, 4, 3, 2, 5, 3, 2, 5, 3, 4, 5, 2, 4, 5, 3,
];

export const randomMarginsLeft = [
  8, 5, 2, -3, 4, 1, 4, 8, 0, 8, 0, 1, 8, 5, 6, 3, 4, 6, 2, 1, 5, 2, 8, 2, 1, 5,
  4, 7, 6, 4, 0, 7, 6, 0, 4, 1, 8, 2, 6, 0, 6, 8, 2, 7, 0, 8, 7, 5, 3, 2, 6, 2,
  8, 6, 1, 0, 4, 6, 2, 1, 4, 5, 8, 4, 3, 2, 0, 8, 4, 3, 6, 2, 5, 2, 4, 8, 6, 7,
  4, 2, 7, 4, 1, 5, 3, 2, 6, 8, 6, 0, 4, 8, 4, 6, 5, 0, 3, 8, 6, 3,
];

export const randomMarginsTop = [
  // 2, 8, 0, 3, 8, -2, 0, 4, -1, 5, -2, 1, 6, 2, -4, 3, -5, 1, -2, 5, 2, -1, 4, 6,

  2,
  0, 0, 3, 8, 2, 0, 4, -1, 5, -2, 1, 6, 2, -4, 3, -5, 1, -2, 5, 2, -1, 4, 6, -5,
  3, 0, -3, 7, 1, 5, -4, 2, -1, 6, -2, 8, -3, 7, 5, -1, 6, 0, -4, 3, -2, 1, 4,
  -5, 7, -1, 3, 2, -4, 5, -3, 1, -2, 4, 8, -5, 6, -1, 2, -3, 5, 0, 3, -4, 7, 1,
  -2, 6, -5, 3, 2, -1, 4, 8, -4, 5, -2, 1, 7, 0, 6, -3, 8, 2, -1, 4, -5, 3, 6,
  0, -4, 7,
];

export function scrollElementIntoView(element: HTMLElement) {
  const scrollContainer = document.getElementById("scrollContainer");
  const containerRect = scrollContainer?.getBoundingClientRect();

  const targetRect = element.getBoundingClientRect();

  const currentScrollLeft = scrollContainer?.scrollLeft || 0;
  const currentScrollTop = scrollContainer?.scrollTop || 0;

  const containerRectLeft = containerRect?.left || 0;
  const containerRectWidth = containerRect?.width || 0;
  const containerRectHeight = containerRect?.height || 0;
  const containerRectTop = containerRect?.top || 0;

  const scrollLeft =
    currentScrollLeft +
    targetRect.left -
    containerRectLeft -
    (containerRectWidth - targetRect.width) / 2;
  const scrollTop =
    currentScrollTop +
    targetRect.top -
    containerRectTop -
    (containerRectHeight - targetRect.height) / 2;

  scrollContainer?.scrollTo({
    top: scrollTop,
    left: scrollLeft,
    behavior: "smooth",
  });
}

let controller: any = null;

export function createController() {
  if (controller) {
    controller.abort();
  }

  controller = new AbortController();
  const signal = controller.signal;

  return signal;
}

export function resolveTypingPromises(
  message: string,
  timeout: number,
  signal = null,
  isRemoving = false
) {
  return [...message].map(
    (ch, i) =>
      new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          isRemoving
            ? resolve(message.substring(0, message.length - i - 1))
            : resolve(message.substring(0, i + 1));
        }, timeout * i);

        signal &&
          // @ts-ignore
          signal.addEventListener("abort", () => {
            clearTimeout(timeoutId);
            reject(new Error("Aborted"));
          });
      })
  );
}

export function processMessage(
  message: string,
  timeout: number,
  signal: any,
  isRemoving = false
) {
  return new Promise((resolve, reject) => {
    const typePromises = resolveTypingPromises(
      message,
      timeout,
      signal,
      isRemoving
    );
    typePromises.forEach((promise, i, arr) => {
      promise
        .then((portion: any) => {
          if (document.querySelector("#terminal")) {
            // @ts-ignore
            document.querySelector("#terminal").innerHTML = portion;
            if (i === arr.length - 1) {
              // @ts-ignore
              resolve();
            }
          }
        })
        .catch(reject);
    });
  });
}

export function setImageOrientation(
  image: HTMLImageElement,
  item: Element,
  isActive: boolean
) {
  let sizeAttr = image.getAttribute("size")?.toLowerCase()
    ? image.getAttribute("size")?.toLowerCase()
    : (image.getAttribute("activeSize")?.toLowerCase() ?? "s");

  if (image.naturalWidth > image.naturalHeight) {
    /* Image is horizontal */
    if (
      isActive &&
      !item.classList.contains(`project__active--horizontal-${sizeAttr}`)
    ) {
      item.classList.remove(`project__active--vertical-${sizeAttr}`);
      item.classList.remove(`project__active--square-${sizeAttr}`);
      item.classList.add(`project__active--horizontal-${sizeAttr}`);
    } else if (!item.classList.contains(`project--horizontal-${sizeAttr}`)) {
      item.classList.remove(`project--vertical-${sizeAttr}`);
      item.classList.remove(`project--square-${sizeAttr}`);
      item.classList.add(`project--horizontal-${sizeAttr}`);
    }
  } else if (image.naturalWidth < image.naturalHeight) {
    /* Image is vertical */
    if (
      isActive &&
      !item.classList.contains(`project__active--vertical-${sizeAttr}`)
    ) {
      item.classList.remove(`project__active--horizontal-${sizeAttr}`);
      item.classList.remove(`project__active--square-${sizeAttr}`);
      item.classList.add(`project__active--vertical-${sizeAttr}`);
    } else if (!item.classList.contains(`project--vertical-${sizeAttr}`)) {
      item.classList.remove(`project--horizontal-${sizeAttr}`);
      item.classList.remove(`project--square-${sizeAttr}`);
      item.classList.add(`project--vertical-${sizeAttr}`);
    }
  } else {
    /* Image is square */
    if (
      isActive &&
      !item.classList.contains(`project__active--square-${sizeAttr}`)
    ) {
      item.classList.remove(`project__active--vertical-${sizeAttr}`);
      item.classList.remove(`project__active--horizontal-${sizeAttr}`);
      item.classList.add(`project__active--square-${sizeAttr}`);
    } else if (!item.classList.contains(`project--square-${sizeAttr}`)) {
      item.classList.remove(`project--vertical-${sizeAttr}`);
      item.classList.remove(`project--horizontal-${sizeAttr}`);
      item.classList.add(`project--square-${sizeAttr}`);
    }
  }
}

export function removeActiveClasses(element: Element) {
  const classes = Array.from(element.classList);

  classes.forEach((className) => {
    if (className.startsWith("project__active--")) {
      element.classList.remove(className);
    }
  });
}
