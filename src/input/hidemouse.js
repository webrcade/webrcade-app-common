const hideInactiveMouse = (element, timeout = 2500) => {
  let timeoutId = null;

  const fTimeout = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = null;
    element.style.cursor = 'none';
  }

  const f = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(fTimeout, timeout);
    element.style.cursor = 'auto';
  }

  element.addEventListener('mousemove', f);
  element.addEventListener('mousedown', f);
  element.addEventListener('mouseup', f);
  element.addEventListener('wheel', f);

  element.style.cursor = 'auto';
  timeoutId = setTimeout(fTimeout, timeout);
}

export { hideInactiveMouse };
