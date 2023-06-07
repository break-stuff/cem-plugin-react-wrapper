import fs from "fs";
import { baseEvents, baseProperties } from "./global.js";
import {
  Attribute,
  CustomElementsManifest,
  Declaration,
  Config,
  EventName,
  MappedAttribute,
  ComponentAttributes,
  Member,
  CssProperty,
  CssPart,
  Parameter,
} from "./types";

import {
  createEventName,
  getModulePath,
  getPackageJson,
  has,
  RESERVED_WORDS,
  saveFile,
  saveReactUtils,
  toCamelCase,
} from "./utils.js";

const packageJson = getPackageJson();
let config: Config = {};

export default function reactWrapper({
  exclude = [],
  attributeMapping = {},
  outdir = "react",
  typescript = true,
  modulePath,
  descriptionSrc,
  slotDocs = true,
  eventDocs = true,
  methodDocs = true,
  cssPropertiesDocs = true,
  cssPartsDocs = true,
}: Config = {}) {
  return {
    name: "cem-plugin-react-wrapper",
    packageLinkPhase(params: any) {
      console.log("[react-wrapper] - Generating React Wrappers");

      config = {
        exclude,
        attributeMapping,
        outdir,
        typescript,
        modulePath,
        descriptionSrc,
        slotDocs,
        eventDocs,
        methodDocs,
        cssPartsDocs,
        cssPropertiesDocs,
      };

      createOutdir(outdir);
      createWrappers(params.customElementsManifest);

      console.log(
        "\u001b[" +
          32 +
          "m" +
          "[react-wrapper] - Successfully Generated React Wrappers\n" +
          "\u001b[0m"
      );
    },
  };
}

function createOutdir(outdir: string) {
  if (!fs.existsSync(outdir)) {
    fs.mkdirSync(outdir, { recursive: true });
  }

  saveReactUtils(outdir);
}

function createWrappers(customElementsManifest: CustomElementsManifest) {
  const components = getComponents(customElementsManifest);
  components.forEach((component) => {
    const events = [...getEventNames(component), ...baseEvents];
    const { booleanAttributes, attributes } = getAttributes(component);
    const properties = getProperties(component, attributes, booleanAttributes);
    const componentModulePath = getModulePath(
      config.modulePath,
      component,
      config.outdir!,
      packageJson
    );

    generateReactWrapper(
      component,
      events,
      booleanAttributes,
      attributes,
      properties,
      componentModulePath
    );

    if (config.typescript) {
      generateTypeDefinition(
        component,
        events,
        booleanAttributes,
        attributes,
        properties,
        componentModulePath
      );
    }
  });

  generateManifests(components, config.outdir!, config.typescript!);
}

function getComponents(customElementsManifest: CustomElementsManifest) {
  return customElementsManifest.modules
    ?.map((mod) =>
      mod?.declarations?.filter(
        (dec: Declaration) =>
          config.exclude &&
          !config.exclude.includes(dec.name) &&
          (dec.customElement || dec.tagName)
      )
    )
    .flat();
}

function generateReactWrapper(
  component: Declaration,
  events: EventName[],
  booleanAttributes: Attribute[],
  attributes: Attribute[],
  properties: Member[],
  componentModulePath: string
) {
  const result = getReactComponentTemplate(
    component,
    events,
    booleanAttributes,
    attributes,
    properties,
    componentModulePath
  );

  saveFile(config.outdir!, `${component.name}.js`, result);
}

function generateTypeDefinition(
  component: Declaration,
  events: EventName[],
  booleanAttributes: Attribute[],
  attributes: Attribute[],
  properties: Member[],
  componentModulePath: string
) {
  const result = getTypeDefinitionTemplate(
    component,
    events,
    booleanAttributes,
    attributes,
    properties,
    componentModulePath
  );

  saveFile(config.outdir!, `${component.name}.d.ts`, result);
}

function generateManifests(
  components: Declaration[],
  outdir: string,
  typescript: boolean
) {
  saveFile(outdir, "index.js", getManifestContentTemplate(components));

  if (typescript) {
    saveFile(outdir, "index.d.ts", getManifestContentTemplate(components));
  }
}

function getProperties(
  component: Declaration,
  attributes: MappedAttribute[],
  booleanAttributes: MappedAttribute[]
) {
  return component?.members?.filter(
    (member) =>
      member.kind === "field" &&
      !member.static &&
      member.privacy !== "private" &&
      member.privacy !== "protected" &&
      !member.attribute &&
      (member.description || member.deprecated) &&
      !booleanAttributes.find((x) => x.propName === member.name) &&
      !attributes.find((x) => x.propName === member.name)
  );
}

function getEventNames(component: Declaration): EventName[] {
  return (
    component?.events?.map((event) => {
      return {
        name: event.name,
        reactName: createEventName(event),
        description: event.description,
        type: event.type?.text,
      };
    }) || []
  );
}

function getAttributes(component: Declaration): ComponentAttributes {
  const result: {
    attributes: MappedAttribute[];
    booleanAttributes: MappedAttribute[];
  } = {
    attributes: [],
    booleanAttributes: [],
  };

  component?.attributes?.forEach((attr) => {
    if (!attr?.name) {
      return;
    }

    /** Handle reserved keyword attributes */
    if (RESERVED_WORDS.includes(attr?.name)) {
      /** If we have a user-specified mapping, rename */
      if (attr.name in config.attributeMapping!) {
        const attribute = getMappedAttribute(attr);
        addAttribute(attribute, result);
        return;
      }
      throwKeywordException(attr, component);
    }

    addAttribute(attr as MappedAttribute, result);
  });

  addGlobalAttributes(result.attributes);

  return result;
}

function addGlobalAttributes(attributes: MappedAttribute[]) {
  baseProperties.forEach((baseAttr: MappedAttribute) => {
    if (!attributes.find((x) => x.name === baseAttr.name)) {
      attributes.push(baseAttr);
    }
  });
}

function getParams(
  booleanAttributes: MappedAttribute[] = [],
  attributes: MappedAttribute[] = [],
  properties: Member[] = [],
  eventNames: EventName[] = []
) {
  return [
    ...[...booleanAttributes, ...attributes].map((attr) => attr.propName),
    ...properties?.map((prop) => prop.name),
    ...eventNames?.map((event) => event.reactName),
  ]?.join(", ");
}

function throwKeywordException(attr: Attribute, component: Declaration) {
  throw new Error(
    `Attribute \`${attr.name}\` in custom element \`${component.name}\` is a reserved keyword and cannot be used. Please provide an \`attributeMapping\` in the plugin options to rename the JavaScript variable that gets passed to the attribute.`
  );
}

function addAttribute(
  attribute: MappedAttribute,
  componentAttributes: ComponentAttributes
) {
  const existingAttr = componentAttributes.attributes.find(
    (x) => x.name === attribute.name
  );
  const existingBool = componentAttributes.booleanAttributes.find(
    (x) => x.name === attribute.name
  );

  if (existingAttr || existingBool) {
    return;
  }

  attribute.propName = toCamelCase(attribute.name);

  if (attribute?.type?.text.includes("boolean")) {
    componentAttributes.booleanAttributes.push(attribute);
  } else {
    componentAttributes.attributes.push(attribute);
  }
}

function getMappedAttribute(attr: Attribute): MappedAttribute {
  return {
    ...attr,
    originalName: attr.name,
    name: config.attributeMapping![attr.name],
  };
}

function getEventTemplates(eventNames: EventName[]) {
  return eventNames.map(
    (event) => `useEventListener(ref, '${event.name}', ${event.reactName});`
  );
}

function getBooleanAttributeTemplates(booleanAttributes: MappedAttribute[]) {
  return booleanAttributes?.map(
    (attr) => `useBooleanAttribute(ref, '${attr.name}', ${attr?.propName});`
  );
}

function getAttributeTemplates(attributes: MappedAttribute[]) {
  return attributes?.map((attr) => {
    if (attr.name !== "className") {
      return `useAttribute(ref, '${attr.originalName || attr?.name}', ${
        attr?.propName
      });`;
    }
  });
}

function getPropTemplates(properties: Member[]) {
  return properties?.map(
    (member) => `useProperties(ref, '${member.name}', ${member.name});`
  );
}

function getReactComponentTemplate(
  component: Declaration,
  events: EventName[],
  booleanAttributes: MappedAttribute[],
  attributes: MappedAttribute[],
  properties: Member[],
  modulePath: string
) {
  const params = getParams(booleanAttributes, attributes, properties, events);
  const eventTemplates = getEventTemplates(events);
  const booleanAttrTemplates = getBooleanAttributeTemplates(booleanAttributes);
  const attrTemplates = getAttributeTemplates(attributes);
  const propTemplates = getPropTemplates(properties);
  const methods = getMethods(component);
  const useEffect =
    has(eventTemplates) ||
    has(propTemplates) ||
    has(attrTemplates) ||
    has(booleanAttrTemplates);

  return `
    import React, { forwardRef, useImperativeHandle ${
      useEffect ? ", useRef" : ""
    } } from "react";
    import { useAttribute, useBooleanAttribute, useProperties, useEventListener } from './react-utils.js';
    import '${modulePath}';

    export const ${component.name} = forwardRef(({children${
    params ? "," : ""
  } ${params}}, forwardedRef) => {
      ${useEffect ? `const ref = useRef(null);` : ""}

      ${has(eventTemplates) ? "/** Event listeners - run once */" : ""}
      ${eventTemplates?.join("") || ""}

      ${
        has(booleanAttrTemplates)
          ? "/** Boolean attributes - run whenever an attr has changed */"
          : ""
      }
      ${booleanAttrTemplates?.join("") || ""}

      ${
        has(attrTemplates)
          ? "/** Attributes - run whenever an attr has changed */"
          : ""
      }
      ${attrTemplates?.join("") || ""}

      ${
        has(propTemplates)
          ? "/** Properties - run whenever a property has changed */"
          : ""
      }
      ${propTemplates?.join("") || ""}

      ${
        has(methods)
          ? "/** Methods - uses `useImperativeHandle` hook to pass ref to component */"
          : ""
      }
      useImperativeHandle(forwardedRef, () => ({
        ${
          methods
            ?.map(
              (method) =>
                `${method.name}: ${getMethodParameters(
                  method.parameters
                )} => ref.current.${method.name}${getMethodParameters(
                  method.parameters
                )}`
            )
            .join(",\n") || ""
        }
      }));

      return React.createElement(
        scope.prefix + "${component.tagName.replace("he", "")}",
        { 
          ${useEffect ? "ref," : ""} 
          ${attributes
            .map((attr) => {
              return (attr.originalName || attr?.name) === attr?.propName
                ? attr?.name
                : `"${attr.originalName || attr?.name}": ${attr?.propName}`;
            })
            .join(", ")}
        },
        children
      );
    });
  `;
}

function getTypeDefinitionTemplate(
  component: Declaration,
  events: EventName[],
  booleanAttributes: Attribute[],
  attributes: Attribute[],
  properties: Member[],
  modulePath: string
) {
  const params = getParams(booleanAttributes, attributes, properties, events);
  const props = getPropsInterface(
    component.name,
    booleanAttributes,
    attributes,
    properties,
    events
  );
  const methods = getMethods(component);

  return `
    import ${component.name}Element from '${modulePath}';

    export type { ${component.name}Element };
    export type * from '${modulePath}';
    
    export interface ${component.name}Props { 
      ${props} 
    }

    declare module "react" {
      interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T>, ${
        component.name
      }Props {
      }
    }
    /** 
     ${getComponentDescription(component)} 
     *
      ${
        has(component.slots) && config.slotDocs
          ? `*
  * ### Slots 
 ${getSlotDocs(component)}`
          : "*"
      }
      ${
        has(component.events) && config.eventDocs
          ? `*
  * ### Events
 ${getEventDocs(events)}`
          : "*"
      }
      ${
        has(methods) && config.methodDocs
          ? `*
  * ### Methods
 ${getMethodDocs(methods)}`
          : "*"
      }
      ${
        has(component.cssProperties) && config.cssPropertiesDocs
          ? `*
  * ### CSS Properties 
 ${getCssPropertyDocs(component.cssProperties)}`
          : "*"
      }
      ${
        has(component.cssParts) && config.cssPartsDocs
          ? `*
  * ### CSS Parts 
 ${getCssPartsDocs(component.cssParts)}`
          : "*"
      }
      *
      */
    export const ${component.name}: React.ForwardRefExoticComponent<${
    component.name
  }Props>;
  `;
}

function getComponentDescription(component: Declaration) {
  const description = config.descriptionSrc
    ? component[config.descriptionSrc]
    : component.summary || component.description;

  return (
    description
      ?.split("\n")
      ?.map((y) => y?.split("\\n").map((x) => ` * ${x}`))
      .flat()
      .join("\n") || "*"
  );
}

function getSlotDocs(component: Declaration) {
  return component.slots
    ?.map(
      (slot) =>
        `  * - ${slot.name ? `**${slot.name}**` : "_default_"} - ${
          slot.description
        }`
    )
    .join("\n");
}

function getEventDocs(events: EventName[]) {
  return events
    ?.map((event) => `  * - **${event.reactName}** - ${event.description}`)
    .join("\n");
}

function getCssPropertyDocs(properties: CssProperty[]) {
  return properties
    ?.map(
      (prop) =>
        `  * - **${prop.name}** - ${prop.description} _(default: ${prop.default})_`
    )
    .join("\n");
}

function getCssPartsDocs(parts: CssPart[]) {
  return parts
    ?.map((part) => `  * - **${part.name}** - ${part.description}`)
    .join("\n");
}

function getMethodDocs(methods: Member[]) {
  return methods
    ?.map(
      (method) =>
        `  * - **${method.name}${getTypedMethodParameters(method.parameters)}${
          method.return ? `: _${method.return.type.text}_` : ""
        }** - ${method.description}`
    )
    .join("\n");
}

function getTypedMethodParameters(parameters?: Parameter[]) {
  return parameters
    ? "(" +
        parameters
          .map(
            (x) => `${x.name + (x?.type?.text ? `: _${x?.type?.text}_` : "")}`
          )
          .join(", ") +
        ")"
    : "()";
}

function getMethodParameters(parameters?: Parameter[]) {
  return parameters
    ? "(" + parameters.map((x) => `${x.name}`).join(", ") + ")"
    : "()";
}

function getPropsInterface(
  componentName: string,
  booleanAttributes: MappedAttribute[],
  attributes: MappedAttribute[],
  properties: Member[],
  events: EventName[]
) {
  return [
    ...(booleanAttributes || []).map(
      (attr) => `
        /** ${attr.description} */
        ${attr?.propName}?: ${attr?.type?.text || "boolean"};
      `
    ),
    ...(attributes || []).map(
      (attr) => `
        /** ${attr.description} */
        ${attr.propName}?: ${
        baseProperties.some((base) => base.propName === attr.propName)
          ? attr.type?.text || "string"
          : `${componentName}Element['${attr.propName}'] ${
              !attr.type?.text.includes("string") &&
              !attr.type?.text.includes("'")
                ? " | string"
                : ""
            }`
      };
      `
    ),
    ...(properties || []).map(
      (prop) => `
      /** ${prop.description} */
      ${prop.name}?: ${
        baseProperties.some((base) => base.propName === prop.name)
          ? prop.type?.text || "string"
          : `${componentName}Element['${prop.name}']`
      };
    `
    ),
    ...events?.map(
      (event) => `
        /** ${event.description} */
        ${event.reactName}?: (event: ${getEventType(
        event.type,
        event.custom
      )}) => void;
      `
    ),
    `
    /** Used to help React identify which items have changed, are added, or are removed within a list. */ 
    key?: string | number;
    `,
    `
    /** Content between the opening and closing component tags. */
    children?: any;
    `,
    `
    /** A mutable ref object whose \`.current\` property is initialized to the passed argument (\`initialValue\`). The returned object will persist for the full lifetime of the component. */
    ref?: any;
    `,
  ]?.join("");
}

function getManifestContentTemplate(components: Declaration[]) {
  return components
    .map((component) => `export * from './${component.name}';`)
    .join("");
}

function getEventType(
  eventType?: string,
  eventCustom?: boolean
) {
  if (eventCustom) {
    return eventType;
  }

  const base = "CustomEvent";

  if (!eventType || eventType === "Event" || eventType === "CustomEvent") {
    return base;
  }

  return base + `<${eventType}>`;
}

function getMethods(component: Declaration) {
  return component.members?.filter(
    (member) =>
      member.kind === "method" &&
      member.privacy !== "private" &&
      member.description?.length
  );
}
