import React, { useEffect, useRef } from "react";
import "../components/radio-group.js";

export function RadioGroup({
  children,
  disabled,
  value,
  size,
  prop1,
  prop2,
  onCustomEvent,
  onTypedEvent,
  onTypedCustomEvent,
}) {
  const ref = useRef(null);
  const component = ref.current;

  /** Event listeners - run once */

  useEffect(() => {
    if (onCustomEvent !== undefined) {
      component?.addEventListener("custom-event", onCustomEvent);
    }
  }, []);

  useEffect(() => {
    if (onTypedEvent !== undefined) {
      component?.addEventListener("typed-event", onTypedEvent);
    }
  }, []);

  useEffect(() => {
    if (onTypedCustomEvent !== undefined) {
      component?.addEventListener("typed-custom-event", onTypedCustomEvent);
    }
  }, []);

  /** Boolean attributes - run whenever an attr has changed */
  useEffect(() => {
    if (disabled !== undefined) {
      if (disabled) {
        component?.setAttribute("disabled", "");
      } else {
        component?.removeAttribute("disabled");
      }
    }
  }, [disabled]);

  /** Attributes - run whenever an attr has changed */
  useEffect(() => {
    if (
      value !== undefined &&
      component?.getAttribute("value") !== String(value)
    ) {
      component?.setAttribute("value", String(value));
    }
  }, [value]);
  useEffect(() => {
    if (
      size !== undefined &&
      component?.getAttribute("size") !== String(size)
    ) {
      component?.setAttribute("size", String(size));
    }
  }, [size]);

  /** Properties - run whenever a property has changed */

  useEffect(() => {
    if (prop1 !== undefined && component?.prop1 !== prop1) {
      component?.prop1 = prop1;
    }
  }, [prop1]);

  useEffect(() => {
    if (prop2 !== undefined && component?.prop2 !== prop2) {
      component?.prop2 = prop2;
    }
  }, [prop2]);

  return React.createElement(
    "radio-group",
    {
      ref,
      disabled,
      value,
      size,
    },
    children
  );
}
