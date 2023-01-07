import { useEffect } from "react";

export function useAttribute(targetElement, attrName, value) {
  useEffect(() => {
    if (
      value !== undefined &&
      attrName !== "style" &&
      targetElement.current?.getAttribute(attrName) !== String(value)
    ) {
      targetElement.current?.setAttribute(attrName, String(value));
    }
  }, [value]);
}

export function useBooleanAttribute(targetElement, attrName, propName) {
  useEffect(() => {
    if (propName !== undefined) {
      if (propName) {
        targetElement.current?.setAttribute(attrName, "");
      } else {
        targetElement.current?.removeAttribute(attrName);
      }
    }
  }, [propName]);
}

export function useProperties(targetElement, propName, value) {
  useEffect(() => {
    if (value !== undefined && targetElement.current[propName] !== value) {
      targetElement.current[propName] = value;
    }
  }, [value]);
}

export function useEventListener(targetElement, eventName, eventHandler) {
  useEffect(() => {
    if (eventHandler !== undefined) {
      targetElement.current.addEventListener(eventName, eventHandler);
    }

    return () => {
      if (eventHandler?.cancel) {
        eventHandler.cancel();
      }

      if (targetElement?.current?.removeEventListener) {
        targetElement.current.removeEventListener(eventName, eventHandler);
      }
    };
  }, [eventName, eventHandler, targetElement]);
}
