import React, { useEffect, useRef } from "react";
import "../components/radio-group.js";

export function Radio({ children, disabled, value }) {
  const ref = useRef(null);
  const component = ref.current;

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

  return React.createElement(
    "radio-group",
    {
      ref,
      disabled,
      value,
    },
    children
  );
}
