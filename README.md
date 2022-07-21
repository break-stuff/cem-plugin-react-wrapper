# cem-plugin-react-wrapper

This is a plugin for the [Custom Element Manifest Analyzer](https://custom-elements-manifest.open-wc.org/) that automatically generates React wrappers for your custom elements based on on the data from the custom elements manifest (CEM).

## Usage

### Install

```bash
npm i -D cem-plugin-react-wrapper
```

### Import

```js
// custom-elements-manifest.config.js

import { cemReactWrapper } from "cem-plugin-react-wrapper";

export default {
  plugins: [cemReactWrapper()],
};
```

## Configuration

The configuration has the following optional parameters:

```ts
{
  attributeMapping?: { [key: string]: string };
  exclude?: string[];
  modulePath?: (className, tagName) => string;
  outdir?: string;
  typescript?: boolean;
}
```

```js
// custom-elements-manifest.config.js

import { cemReactWrapper } from "cem-react-wrapper";

export default {
  plugins: [
    cemReactWrapper({
      /** Provide an attribute mapping to avoid collisions with JS/React reserved keywords */
      attributeMapping: {
        for: "_for",
      },

      /** Array of class names to exclude */
      exclude: ["MyElement"],

      /** Specify the path where the component module is defined */
      modulePath: (className, tagName) => `../dist/${tagName}/${className}.js`,

      /** Output directory to write the React wrappers to */
      outdir: `build`,

      /** If true, types will be created for your wrappers */
      typescript: true,
    }),
  ],
};
```

### Attribute Mapping

React components operate as JavaScript functions and because of that, there are a number of reserved words in React and JavaScript that will cause problems if they are used in React components. To prevent this from happening, the `attributeMapping` object allows you to create alternate names for attributes to prevent naming collisions. The attribute for your component will remain the same, but the React component will take advantage of these alternate names to prevent issues.

```js
{
  attributeMapping: {
    for: "_for",
    goto: "go_to"
  },
}
```

```jsx
<MyElement _for={'Some Value'} />
```

### Exclude

Many component libraries contain internal components used to help construct other components. These may not necessarily need their own wrapper. If that's the case, they can be excluded from the process using the `exclude` property. Pass an array fo the class names you would like to exclude and they will be skipped.

```js
{
  exclude: ['MyInternalElement', 'MyOtherInternalElement']
}
```

### Module Path

This setting is used to determine where to pull the pull the logic for the custom element. If nothing is defined, it will try to use the `module` property defined in the `package.json`, otherwise it will throw an error.

This configuration accepts a `function` with the component's class name and tag name as parameters. This should provide greater flexibility in identifying file locations.

***Note:*** _These paths are relative to the React wrapper output directory._

```js
{
  modulePath: (className, tagName) => `../dist/${tagName}/${className}.js`,
}
```

If there is only a single entry point, a simple string with the path referenced can be returned.

```js
{
  modulePath: () => `../dist/index.js`,
}
```

Advanced logic can also be abstracted.

```js
{
  modulePath: (className, tagName) => getMyComponentPath(className, tagName),
}
```

### Output Directory

The `outdir` configuration identifies where the wrappers will be added. The default directory is called `react`. 

In addition to the wrappers a manifest file (`index.js`) to provide a single point of entry to access the components.

```js
import { MyElement, MyOtherElement } from './react';
```

Components can also be accessed directly from each component file.

```js
import { MyElement } from './react/MyElement.js';
import { MyOtherElement } from './react/MyOtherElement.js';
```

### TypeScript

Setting the `typescript` property to `true` will generate type definition files (`.d.ts`) files for each of the components.

## Attributes and Properties

All attributes and public property names (with the exception of those that were mapped using the `attributeMapping` config) are converted to camel-case properties on the React component.

```jsx
<MyCheckbox myLabel={'My Checkbox'} />
```

Additionally, complex objects can also be passed as properties as well.

```jsx
<MyTodoList items={['Wash car', 'Pay bills', 'Deploy code']} />
```

## Slots

Slotted items get passed to the component slot using the `children` property under the hood and should behave like normal slots.

```jsx
<MySelect>
  <span slot="label">My Label</span>
  <MyOption>Option 1</MyOption>
  <MyOption>Option 2</MyOption>
  <MyOption>Option 3</MyOption>
</MySelect>
```

## Events

Event names are converted to camel-case names prefixed with `on`. For example, an event named `my-change` will be converted to `onMyChange`.

```jsx
<MySelect onMyChange={e => handleMyChange(e)} />
```
