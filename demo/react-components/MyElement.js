import React, { useEffect, useRef } from "react";
import "../../../index.js";

export function MyElement({
  children,
  disabled,
  foo,
  fooAlt,
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
    if (undefined !== undefined) {
      if (undefined) {
        component?.setAttribute("undefined", "");
      } else {
        component?.removeAttribute("undefined");
      }
    }
  }, [disabled]);

  /** Attributes - run whenever an attr has changed */

  useEffect(() => {
    if (
      undefined !== undefined &&
      component?.getAttribute("undefined") !== String(undefined)
    ) {
      component?.setAttribute("undefined", String(undefined));
    }
  }, [undefined]);

  useEffect(() => {
    if (
      undefined !== undefined &&
      component?.getAttribute("undefined") !== String(undefined)
    ) {
      component?.setAttribute("undefined", String(undefined));
    }
  }, [undefined]);

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
    "my-element",
    {
      ref,
      disabled,
      foo,
      "foo-alt": fooAlt,
    },
    children
  );
}
