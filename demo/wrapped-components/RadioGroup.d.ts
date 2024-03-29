import { RadioGroup as RadioGroupElement } from "../components/radio-group.js";

export type { RadioGroupElement };
export type * from "../components/radio-group.js";

export interface RadioGroupProps {
  /** Disables the element */
  disabled?: boolean;

  /** The value of the selected radio */
  value?: RadioGroupElement["value"];

  /** This will control the size of radio buttons */
  size?: RadioGroupElement["size"] | string;

  /** This will control the size of radio buttons */
  helpText?: RadioGroupElement["helpText"] | string;

  /** Defines a unique identifier (ID) which must be unique in the whole document. Its purpose is to identify the element when linking (using a fragment identifier), scripting, or styling (with CSS). */
  id?: string;

  /** A space-separated list of the classes of the element. Classes allows CSS and JavaScript to select and access specific elements via the class selectors or functions like the method `Document.getElementsByClassName()`. */
  className?: string;

  /** Contains CSS styling declarations to be applied to the element. Note that it is recommended for styles to be defined in a separate file or files. This attribute and the <style> element have mainly the purpose of allowing for quick styling, for example for testing purposes. */
  style?: string | object;

  /** Assigns a slot in a shadow DOM shadow tree to an element: An element with a slot attribute is assigned to the slot created by the `<slot>` element whose [name](https://developer.mozilla.org/docs/Web/HTML/Element/slot#attr-name) attribute's value matches that slot attribute's value. */
  slot?: string;

  /** Prevents content from being rendered by the browser. */
  hidden?: boolean;

  /** this toggles some unseen feature */
  prop1?: RadioGroupElement["prop1"];

  /** this will adjust thr width of the unit */
  prop2?: RadioGroupElement["prop2"];

  /** some description for custom-event */
  onCustomEvent?: (event: CustomEvent) => void;

  /** some description for typed-event */
  onTypedEvent?: (event: CustomEvent) => void;

  /** some description for typed-custom-event */
  onTypedCustomEvent?: (event: CustomEvent<MyType>) => void;

  /** A pointing device button has been pressed and released on an element. */
  onClick?: (event: MouseEvent) => void;

  /** Used to help React identify which items have changed, are added, or are removed within a list. */
  key?: string | number;

  /** Content between the opening and closing component tags. */
  children?: any;

  /** A mutable ref object whose `.current` property is initialized to the passed argument (`initialValue`). The returned object will persist for the full lifetime of the component. */
  ref?: any;
}

declare module "react" {
  interface HTMLAttributes<T>
    extends AriaAttributes,
      DOMAttributes<T>,
      RadioGroupProps {}
}
/**
 *
 * Radio groups are used to group multiple radios or radio buttons so they function as a single form control. Here is its [documentation](https://github.com/microsoft/vscode-custom-data/blob/master/samples/webcomponents/src/components/my-component/docs.md).
 *
 * Use it like this:
 * ```html
 * <RadioGroup value="2" size={3}>
 *   <span slot="label">My Label</span>
 *   <Radio value="1">Option 1</Radio>
 *   <Radio value="2">Option 2</Radio>
 *   <Radio value="3">Option 3</Radio>
 * </RadioGroup>
 * ```
 *
 *
 * ### Slots
 * - _default_ - add radio buttons to the `default` slot to create options to your radio group
 * - **label** - placeholder for the radio group label
 *
 * ### Events
 * - **onCustomEvent** - some description for custom-event
 * - **onTypedEvent** - some description for typed-event
 * - **onTypedCustomEvent** - some description for typed-custom-event
 * - **onClick** - A pointing device button has been pressed and released on an element.
 *
 * ### Methods
 * - **checkValidity()** - Checks the validity of the radio group
 *
 * ### CSS Properties
 * - **--text-color** - Controls the color of foo _(default: undefined)_
 * - **--background-color** - Controls the color of bar _(default: red)_
 *
 * ### CSS Parts
 * - **bar** - Styles the color of bar
 *
 */
export const RadioGroup: React.ForwardRefExoticComponent<RadioGroupProps>;
