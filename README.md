# Web Component React Wrapper

> This project has been moved to the [Custom Element React Wrappers](https://www.npmjs.com/package/custom-element-react-wrappers) project.

Make your web components React compatible with as little as one line of code!

- No manual event mapping
- Automatically generates types for your components and props
- Provides editor autocomplete features and documentation
- Configurable
- Very easy to set up and use

![an animated image of the autocomplere functionality in vs code](https://github.com/break-stuff/cem-plugin-react-wrapper/blob/master/demo/images/demo.gif?raw=true)

---

This tool leverages the [Custom Element Manifest Analyzer](https://custom-elements-manifest.open-wc.org/) that automatically generates React wrappers for your custom elements based on on the data from the custom elements manifest (CEM).

## Usage

### Pre-installation

Ensure the following steps have been taken in your component library prior to using this plugin:

- Install and set up the [Custom Elements Manifest Analyzer](https://custom-elements-manifest.open-wc.org/analyzer/getting-started/)
- Create a [config file](https://custom-elements-manifest.open-wc.org/analyzer/config/#config-file)

### Install

```bash
npm i -D cem-plugin-react-wrapper
```

### Import

```js
// custom-elements-manifest.config.js

import { reactWrapper } from "cem-plugin-react-wrapper";

export default {
  ...
  plugins: [
    reactWrapper()
  ],
};
```

### Enjoy!

Once you run the analyzer, you should see a new directory (the default directory name is `react`) with the component wrappers and their types!

You should now be able to start using your "react" components or deploy them with your component library for others to enjoy.

```js
import { MyElement, MyOtherElement } from "./react";

// or

import { MyElement, MyOtherElement } from "my-component-library/react";
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
  descriptionSrc?: string;
  slotDocs?: boolean;
  eventDocs?: boolean;
  methodDocs?: boolean;
}
```

```js
// custom-elements-manifest.config.js

import { reactWrapper } from "cem-react-wrapper";

export default {
  plugins: [
    reactWrapper({
      /** Provide an attribute mapping to avoid collisions with JS/React reserved keywords */
      attributeMapping: {
        for: "_for",
      },

      /** Array of class names to exclude */
      exclude: ["MyElement"],

      /** Specify the path where the component module is defined */
      modulePath: (className, tagName) => `../dist/${tagName}/${className}.js`,

      /** Output directory to write the React wrappers to - default is "react" */
      outdir: `build`,

      /** If true, types will be created for your wrappers - default is "true" */
      typescript: true,

      /** The property name from the component object constructed by the CEM Analyzer */
      descriptionSrc: 'description',

      /** Displays the slot section of the element description */
      slotDocs: true

      /** Displays the events section of the element description */
      eventDocs: true

      /** Displays the methods section of the element description */
      methodDocs: true
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
<MyElement _for={"Some Value"} />
```

### Exclude

Many component libraries contain internal components and base classes used to help construct other components. These may not necessarily need their own wrapper. If that's the case, they can be excluded from the process using the `exclude` property. Pass an array fo the class names you would like to exclude and they will be skipped.

```js
{
  exclude: ["MyInternalElement", "MyBaseClass"];
}
```

### Module Path

This setting is used to determine where to pull the pull the logic for the custom element. If nothing is defined, it will try to use the `module` property defined in the `package.json`, otherwise it will throw an error.

This configuration accepts a `function` with the component's class name and tag name as parameters. This should provide greater flexibility in identifying file locations.

**_Note:_** _These paths are relative to the React wrapper output directory._

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
import { MyElement, MyOtherElement } from "./react";
```

Components can also be accessed directly from each component file.

```js
import { MyElement } from "./react/MyElement.js";
import { MyOtherElement } from "./react/MyOtherElement.js";
```

### TypeScript Types

Setting the `typescript` property to `true` will generate type definition files (`.d.ts`) files for each of the components. The property is `true` by default.

### Descriptions

Using the `descriptionSrc` configuration, you can determine the source of the text that gets displayed in the editor autocomplete bubble. This is useful if you want to provide alternate descriptions for your React users.

If no value is provided, the plugin will use the `summary` property and then fall back to the `description` property if a summary is not available.

![description section of autocomplete popup from vs code](https://github.com/break-stuff/cem-plugin-react-wrapper/blob/master/demo/images/description.png?raw=true)

**Note:** _Descriptions support multiple lines by breaking the comment up into multiple lines whereas summaries do not and will need to be manually added using `\n`._

```js
// description example

/**
 *
 * Radio groups are used to group multiple radios or radio buttons so they function as a single form control. Here is its [documentation](https://my-docsite.com).
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
 */
```

```js
// summary example

/**
 *
 * @summary Radios buttons allow users to select a single option from a group. Here is its [documentation](https://my-site.com/documentation).\n\nUse it like this:\n```html\n<Radio value="1" disabled>Your label</Radio>\n```
 *
 * /
```

## Attributes and Properties

All attributes and public property names (with the exception of those that were mapped using the `attributeMapping` config) are converted to camel-case properties on the React component.

```jsx
<MyCheckbox myLabel={"My Checkbox"} />
```

Additionally, complex objects can also be passed as properties as well.

```jsx
<MyTodoList items={["Wash car", "Pay bills", "Deploy code"]} />
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

Slot information will display with the element description during autocompletion or when hovered over. This section can be hidden by setting `slotDocs` to `false` in the config.

![slot section of autocomplete popup from vs code](https://github.com/break-stuff/cem-plugin-react-wrapper/blob/master/demo/images/slots.png?raw=true)

## Events

Event names are converted to camel-case names prefixed with `on`. For example, an event named `my-change` will be converted to `onMyChange`.

```jsx
<MySelect onMyChange={handleMyChange} />
```

Event information will display with the element description during autocompletion or when hovered over. This section can be hidden by setting `slotEvents` to `false` in the config.

![events section of autocomplete popup from vs code](https://github.com/break-stuff/cem-plugin-react-wrapper/blob/master/demo/images/events.png?raw=true)

## CSS

Component-specific [CSS Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties) and [CSS Parts](https://developer.mozilla.org/en-US/docs/Web/CSS/::part) are included in the component documentation. These can be hidden using the `cssPropertiesDocs` and `cssPartsDocs` configuration options respectively.

![css properties and css parts sections of autocomplete popup from vs code](https://github.com/break-stuff/cem-plugin-react-wrapper/blob/master/demo/images/css.png?raw=true)

## TypeScript Support

There are a few important things to keep in mind when using types in your new React-wrapped components.

### Component Type

Your component wrappers will likely have the same name as the class used to declare the custom element. In order to prevent name collisions, references to your component will be suffixed with `Element` - (example - `MySwitch` -> `MySwitchElement`). This is useful if you want to provide types and autocomplete when using `refs` with your components.

```tsx
import React, { useRef } from "react";
import { MySwitch, MySwitchElement } from "../components/react";

export default () => {
  const switchRef = useRef<MySwitchElement>(null);

  const handleClick = () => {
    switchRef.current?.toggle();
  };

  return (
    <>
      <button onClick={handleClick}>Toggle</button>
      <MySwitch ref={switchRef} />
    </>
  );
}
```

This is also important when referencing an element from the event target.

```tsx
import { MyInput, MyInputElement, MyInputChangeEvent } from "../components/react";

export default () => {
  // If your events have a `details` payload, be sure to provide types and export them. They will be included in the wrapper types.
  const handleChange = (e: CustomEvent<MyInputChangeEvent>) => {
    const value = (e.target as MyInputElement).value;
    ...
  };

  return <MyInput onChange={handleChange} />;
}
```

### Prop Types

Each React component will provide types for the component properties using the component name suffixed with `Props` (example - `MyButton` -> `MyButtonProps`). This will automatically be applied to the component to provide editor autocomplete and type-safety, but there may be times where you need access to the types of those properties. The example below shows how you can import the prop types to provide relevant types to your state management and other values in your components.


```tsx
import { MyButton, MyButtonProps } from "../components/react";

export default () => {
  // Now TypeScript will only allow valid variants to be set using `setButtonVariant` and the `variant` prop will identify `buttonVariant` as a valid variable type.
  const [buttonVariant, setButtonVariant] = useState<MyButtonProps['variant']>('primary');

  return <MyButton variant={buttonVariant}>Button</MyButton>;
}
```