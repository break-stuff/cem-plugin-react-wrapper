import React, { useRef } from "react";
import {
  useAttribute,
  useBooleanAttribute,
  useProperties,
  useEventListener,
} from "./react-utils";
import "../components/radio-group.js";

export function Radio({
  children,
  disabled,
  value,
  id,
  className,
  style,
  slot,
  onClick,
}) {
  const ref = useRef(null);

  /** Event listeners */
  useEventListener(ref, "click", onClick);

  /** Boolean attributes */
  useBooleanAttribute(ref, "disabled", disabled);

  /** Attributes */
  useAttribute(ref, "value", value);
  useAttribute(ref, "id", id);
  useAttribute(ref, "class", className);
  useAttribute(ref, "style", style);
  useAttribute(ref, "slot", slot);

  return React.createElement(
    "radio-group",
    {
      ref,
      value,
      id,
      className,
      style,
      slot,
    },
    children
  );
}
