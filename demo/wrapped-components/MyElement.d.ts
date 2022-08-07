import React from "react";
import "../components/my-element.js";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "my-element": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

export interface MyElementProps {
  children?: any;
  /** disables the element */
  disabled?: boolean;

  /** description for foo */
  foo?: string;

  /** description for foo */
  fooAlt?: 1 | 2 | 3 | 4;

  /** some description */
  prop1?: boolean;

  /** some description */
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
      MyElementProps {}
}

/** My custom component. Here is its [documentation](https://github.com/microsoft/vscode-custom-data/blob/master/samples/webcomponents/src/components/my-component/docs.md). */
export declare function MyElement({
  children,
  disabled,
  foo,
  fooAlt,
  prop1,
  prop2,
  onCustomEvent,
  onTypedEvent,
  onTypedCustomEvent,
}: MyElementProps): JSX.Element;
