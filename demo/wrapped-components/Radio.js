import React, { forwardRef, useImperativeHandle, useRef } from "react";
import {
  useAttribute,
  useBooleanAttribute,
  useProperties,
  useEventListener,
} from "./react-utils.js";
import "../components/radio-button.js";

export const Radio = forwardRef(
  (
    { children, disabled, value, id, className, style, slot, hidden, onClick },
    forwardedRef
  ) => {
    const ref = useRef(null);

    /** Event listeners - run once */
    useEventListener(ref, "click", onClick);

    /** Boolean attributes - run whenever an attr has changed */
    useBooleanAttribute(ref, "disabled", disabled);

    /** Attributes - run whenever an attr has changed */
    useAttribute(ref, "value", value);
    useAttribute(ref, "id", id);
    useAttribute(ref, "style", style);
    useAttribute(ref, "slot", slot);
    useAttribute(ref, "hidden", hidden);

    useImperativeHandle(forwardedRef, () => ({}));

    return React.createElement(
      scope.prefix + "radio-button",
      {
        ref,
        value,
        id,
        class: className,
        style,
        slot,
        hidden,
      },
      children
    );
  }
);
