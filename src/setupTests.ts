import '@testing-library/jest-dom';

// Polyfill for PointerEvent (needed for framer-motion in tests)
if (typeof PointerEvent === 'undefined') {
  (global as any).PointerEvent = class PointerEvent extends Event {
    constructor(type: string, eventInitDict?: PointerEventInit) {
      super(type, eventInitDict);
    }
  };
}