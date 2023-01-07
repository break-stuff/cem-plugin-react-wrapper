import React, { useRef } from "react";
import {
  useAttribute,
  useBooleanAttribute,
  useProperties,
  useEventListener,
} from "./react-utils";
import "../components/radio-group.js";

export function RadioGroup({
  children,
  disabled,
  value,
  size,
  helpText,
  id,
  className,
  style,
  slot,
  prop1,
  prop2,
  onCustomEvent,
  onTypedEvent,
  onTypedCustomEvent,
  onClick,
}) {
  const ref = useRef(null);

  /** Event listeners */
  useEventListener(ref, "custom-event", onCustomEvent);
  useEventListener(ref, "typed-event", onTypedEvent);
  useEventListener(ref, "typed-custom-event", onTypedCustomEvent);
  useEventListener(ref, "click", onClick);

  /** Boolean attributes */
  useBooleanAttribute(ref, "disabled", disabled);

  /** Attributes */
  useAttribute(ref, "value", value);
  useAttribute(ref, "size", size);
  useAttribute(ref, "help-text", helpText);
  useAttribute(ref, "id", id);
  useAttribute(ref, "class", className);
  useAttribute(ref, "style", style);
  useAttribute(ref, "slot", slot);

  /** Properties */
  useProperties(ref, "prop1", prop1);
  useProperties(ref, "prop2", prop2);

  return React.createElement(
    "radio-group",
    {
      ref,
      value,
      size,
      "help-text": helpText,
      id,
      className,
      style,
      slot,
    },
    children
  );
}
