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

export interface RadioProps {
  children?: any;
  /** Disables the radio button */
  disabled?: boolean;

  /** The value assigned to the radio group */
  value?: string;
}

declare module "react" {
  interface HTMLAttributes<T>
    extends AriaAttributes,
      DOMAttributes<T>,
      RadioProps {}
}

/**
 *
 * My custom component. Here is its [documentation](https://my-site.com/documentation).
 *
 * Use it like this:
 * ```html
 * <Radio value="1" disabled>Your label</Radio>
 * ```
 *
 * **Slots**
 * - _default_ - add text here to label your radio button
 *
 */
export declare function Radio({
  children,
  disabled,
  value,
}: RadioProps): JSX.Element;
