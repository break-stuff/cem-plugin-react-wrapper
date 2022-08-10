import React from "react";
import "../components/radio-group.js";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "radio-group": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

export interface RadioGroupProps {
  children?: any;
  /** Disables the element */
  disabled?: boolean;

  /** The value of the selected radio */
  value?: string;

  /** This will control the size of radio buttons */
  size?: 1 | 2 | 3 | 4;

  /** this toggles some unseen feature */
  prop1?: boolean;

  /** this will adjust thr width of the unit */
  prop2?: number;

  /** some description for custom-event */
  onCustomEvent?: EventListenerOrEventListenerObject;

  /** some description for typed-event */
  onTypedEvent?: EventListenerOrEventListenerObject;

  /** some description for typed-custom-event */
  onTypedCustomEvent?: EventListenerOrEventListenerObject;
}

declare module "react" {
  interface HTMLAttributes<T>
    extends AriaAttributes,
      DOMAttributes<T>,
      RadioGroupProps {}
}

/**
 *
 * Radio Group - Here is its [documentation](https://github.com/microsoft/vscode-custom-data/blob/master/samples/webcomponents/src/components/my-component/docs.md).
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
 * **Slots**
 * - _default_ - add radio buttons to the `default` slot to add options to your radio group
 * - **label** - placeholder for the radio group label
 */
export declare function RadioGroup({
  children,
  disabled,
  value,
  size,
  prop1,
  prop2,
  onCustomEvent,
  onTypedEvent,
  onTypedCustomEvent,
}: RadioGroupProps): JSX.Element;
