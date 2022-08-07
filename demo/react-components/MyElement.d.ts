import React from "react";
import "../../../index.js";

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
  disabled?: boolean;
  foo?: string;
  fooAlt?: 1 | 2 | 3 | 4;
  prop1?: boolean;
  prop2?: number;
  onCustomEvent?: EventListenerOrEventListenerObject;
  onTypedEvent?: EventListenerOrEventListenerObject;
  onTypedCustomEvent?: EventListenerOrEventListenerObject;
}

declare module "react" {
  interface HTMLAttributes<T>
    extends AriaAttributes,
      DOMAttributes<T>,
      MyElementProps {}
}

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
