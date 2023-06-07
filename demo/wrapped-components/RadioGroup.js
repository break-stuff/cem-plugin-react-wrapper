import React, { forwardRef, useImperativeHandle, useRef } from "react";
import {
  useAttribute,
  useBooleanAttribute,
  useProperties,
  useEventListener,
} from "./react-utils.js";
import "../components/radio-group.js";

export const RadioGroup = forwardRef(
  (
    {
      children,
      disabled,
      value,
      size,
      helpText,
      id,
      className,
      style,
      slot,
      hidden,
      prop1,
      prop2,
      onCustomEvent,
      onTypedEvent,
      onTypedCustomEvent,
      onClick,
    },
    forwardedRef
  ) => {
    const ref = useRef(null);

    /** Event listeners - run once */
    useEventListener(ref, "custom-event", onCustomEvent);
    useEventListener(ref, "typed-event", onTypedEvent);
    useEventListener(ref, "typed-custom-event", onTypedCustomEvent);
    useEventListener(ref, "click", onClick);

    /** Boolean attributes - run whenever an attr has changed */
    useBooleanAttribute(ref, "disabled", disabled);

    /** Attributes - run whenever an attr has changed */
    useAttribute(ref, "value", value);
    useAttribute(ref, "size", size);
    useAttribute(ref, "help-text", helpText);
    useAttribute(ref, "id", id);
    useAttribute(ref, "style", style);
    useAttribute(ref, "slot", slot);
    useAttribute(ref, "hidden", hidden);

    /** Properties - run whenever a property has changed */
    useProperties(ref, "prop1", prop1);
    useProperties(ref, "prop2", prop2);

    /** Methods - uses `useImperativeHandle` hook to pass ref to component */
    useImperativeHandle(forwardedRef, () => ({
      checkValidity: () => ref.current.checkValidity(),
    }));

    return React.createElement(
      scope.prefix + "radio-group",
      {
        ref,
        value,
        size,
        "help-text": helpText,
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
