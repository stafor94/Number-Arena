export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
export const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
export const clamp = (value, min, max = Number.POSITIVE_INFINITY) => Math.min(max, Math.max(min, value));

export const onTouchTap = (element, handler) => {
  let activePointerId = null;
  let lastTouchAt = 0;
  const reset = () => { activePointerId = null; };
  element.addEventListener('pointerdown', (event) => {
    if (event.pointerType !== 'touch') return;
    event.preventDefault();
    activePointerId = event.pointerId;
    element.setPointerCapture?.(event.pointerId);
  });
  element.addEventListener('pointerup', (event) => {
    if (event.pointerType !== 'touch' || event.pointerId !== activePointerId) return;
    event.preventDefault();
    reset();
    if (!element.contains(document.elementFromPoint(event.clientX, event.clientY))) return;
    lastTouchAt = Date.now();
    handler(event);
  });
  element.addEventListener('pointercancel', reset);
  element.addEventListener('lostpointercapture', reset);
  element.addEventListener('click', (event) => {
    if (event.pointerType === 'touch' || Date.now() - lastTouchAt < 700) return;
    handler(event);
  });
};
