import React from "react";
import "../components/radio-button.js";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "radio-button": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

export interface RadioProps {
  children?: any;
}

declare module "react" {
  interface HTMLAttributes<T>
    extends AriaAttributes,
      DOMAttributes<T>,
      RadioProps {}
}

/**
 * My custom component. Here is its [documentation](https://github.com/microsoft/vscode-custom-data/blob/master/samples/webcomponents/src/components/my-component/docs.md).
 * Use it like this:
 * ```html
 * <my-component type='text'></my-component>
 * <my-component
 *   type='color'
 *   color='#00bb00'
 * ></my-component>
 * ```
 *
 */
export declare function Radio({ children }: RadioProps): JSX.Element;
