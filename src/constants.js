const isTouchCapable =
  "ontouchstart" in window ||
  (window.DocumentTouch && document instanceof window.DocumentTouch) ||
  navigator.maxTouchPoints > 0 ||
  window.navigator.msMaxTouchPoints > 0;

export const EVENT_MOVE = isTouchCapable ? "pointermove" : "mousemove";
export const EVENT_MOUSE_UP = isTouchCapable ? "pointerup" : "mouseup";
export const EVENT_MOUSE_DOWN = isTouchCapable ? "pointerdown" : "mousedown";
