/**
 * Utility functions for handling fullscreen mode
 */

/**
 * Request fullscreen for an element
 * @param element The element to make fullscreen
 * @returns Promise that resolves when fullscreen is entered
 */
export const enterFullscreen = (element: HTMLElement): Promise<void> => {
  if (element.requestFullscreen) {
    return element.requestFullscreen();
  } else if ((element as any).mozRequestFullScreen) {
    return (element as any).mozRequestFullScreen();
  } else if ((element as any).webkitRequestFullscreen) {
    return (element as any).webkitRequestFullscreen();
  } else if ((element as any).msRequestFullscreen) {
    return (element as any).msRequestFullscreen();
  }
  return Promise.reject("Fullscreen API not supported");
};

/**
 * Exit fullscreen mode
 * @returns Promise that resolves when fullscreen is exited
 */
export const exitFullscreen = (): Promise<void> => {
  if (document.exitFullscreen) {
    return document.exitFullscreen();
  } else if ((document as any).mozCancelFullScreen) {
    return (document as any).mozCancelFullScreen();
  } else if ((document as any).webkitExitFullscreen) {
    return (document as any).webkitExitFullscreen();
  } else if ((document as any).msExitFullscreen) {
    return (document as any).msExitFullscreen();
  }
  return Promise.reject("Fullscreen API not supported");
};

/**
 * Check if the browser is currently in fullscreen mode
 * @returns boolean indicating if in fullscreen mode
 */
export const isFullscreen = (): boolean => {
  return !!(
    document.fullscreenElement ||
    (document as any).mozFullScreenElement ||
    (document as any).webkitFullscreenElement ||
    (document as any).msFullscreenElement
  );
};

/**
 * Toggle fullscreen mode for an element
 * @param element The element to toggle fullscreen for
 * @returns Promise that resolves when the toggle is complete
 */
export const toggleFullscreen = async (element: HTMLElement): Promise<void> => {
  if (isFullscreen()) {
    return exitFullscreen();
  } else {
    return enterFullscreen(element);
  }
};
