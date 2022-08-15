import fs from "fs";
import {
  Attribute,
  CustomElementsManifest,
  Declaration,
  Config,
  EventName,
  MappedAttribute,
  ComponentAttributes,
  Member,
} from "./types";

import {
  toCamelCase,
  createEventName,
  has,
  RESERVED_WORDS,
  getModulePath,
  saveFile,
  getPackageJson,
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
}: Config = {}) {
  return {
    name: "cem-plugin-react-wrapper",
    packageLinkPhase(params: any) {
      console.log(
        "\u001b[" +
          32 +
          "m" +
          "[react-wrapper] - Generating Components" +
          "\u001b[0m"
      );

      config = {
        exclude,
        attributeMapping,
        outdir,
        typescript,
        modulePath,
        descriptionSrc,
        slotDocs,
        eventDocs,
      };

      createOutdir(outdir);
      createWrappers(params.customElementsManifest);
    },
  };
}

function createOutdir(outdir: string) {
  if (!fs.existsSync(outdir)) {
    fs.mkdirSync(outdir);
  }
}

function createWrappers(customElementsManifest: CustomElementsManifest) {
  const components = getComponents(customElementsManifest);

  components.forEach((component) => {
    const events = getEventNames(component);
    const { booleanAttributes, attributes } = getAttributes(component);
    const properties = getFields(component, attributes, booleanAttributes);
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

function getFields(
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
      member.type &&
      !booleanAttributes.find((x) => x.name === member.name) &&
      !attributes.find((x) => x.name === member.name)
  );
}

function getEventNames(component: Declaration): EventName[] {
  return (
    component?.events?.map((event) => {
      return {
        name: event.name,
        reactName: createEventName(event),
        description: event.description,
      };
    }) || []
  );
}

function getAttributes(component: Declaration): ComponentAttributes {
  const result = {
    attributes: [],
    booleanAttributes: [],
  };

  component?.attributes?.forEach((attr) => {
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

  return result;
}

function getParams(
  booleanAttributes: Attribute[] = [],
  attributes: Attribute[] = [],
  properties: Member[] = [],
  eventNames: EventName[] = []
) {
  return [
    ...[...booleanAttributes, ...attributes].map((attr) =>
      toCamelCase(attr.name)
    ),
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
    (event) => `
      useEffect(() => {
        if(${event.reactName} !== undefined) {
          component?.addEventListener('${event.name}', ${event.reactName});
        }
      }, [])
    `
  );
}

function getBooleanAttributeTemplates(booleanAttributes: MappedAttribute[]) {
  return booleanAttributes?.map((attr) => {
    attr.fieldName = attr?.fieldName || toCamelCase(attr?.name);

    return `useEffect(() => {
        if(${attr?.fieldName} !== undefined) {
          if(${attr?.fieldName}) {
            component?.setAttribute('${attr.name}', '');
          } else {
            component?.removeAttribute('${attr.name}');
          }
        }
      }, [${attr?.fieldName}])
    `;
  });
}

function getAttributeTemplates(attributes: MappedAttribute[]) {
  return attributes?.map((attr) => {
    attr.fieldName = attr?.fieldName || toCamelCase(attr?.name);

    return `useEffect(() => {
        if(${attr?.fieldName} !== undefined && component?.getAttribute('${attr?.name}') !== String(${attr?.fieldName})) {
                  component?.setAttribute('${attr?.name}', String(${attr?.fieldName}))
        }
      }, [${attr?.fieldName}])
  `;
  });
}

function getPropTemplates(properties: Member[]) {
  return properties?.map(
    (member) => `
      useEffect(() => {
        if(${member.name} !== undefined && component?.${member.name} !== ${member.name}) {
          component?.${member.name} = ${member.name};
        }
      }, [${member.name}])
  `
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
  const useEffect =
    has(eventTemplates) ||
    has(propTemplates) ||
    has(attrTemplates) ||
    has(booleanAttrTemplates);

  return `
    import React${useEffect ? ", {useEffect, useRef}" : ""} from "react";
    import '${modulePath}';

    export function ${component.name}({children${
    params ? "," : ""
  } ${params}}) {
      ${useEffect ? `const ref = useRef(null);` : ""}
      ${useEffect ? `const component = ref.current;` : ""}

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

      return React.createElement(
        "${component.tagName}",
        { 
          ${useEffect ? "ref," : ""} 
          ${[...booleanAttributes, ...attributes]
            .map((attr) => {
              attr.fieldName = attr?.fieldName || toCamelCase(attr?.name);
              return attr?.name === attr?.fieldName
                ? attr?.name
                : `"${attr?.name}": ${attr?.fieldName}`;
            })
            .join(", ")}
        },
        children
      );
    }
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

  return `
    import React from "react";
    import '${modulePath}';
   
    declare global {
      namespace JSX {
        interface IntrinsicElements {
            '${
              component.tagName
            }': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
        }
      }
    }

    export interface ${component.name}Props { 
      ${getPropsInterface(booleanAttributes, attributes, properties, events)} 
    }

    declare module "react" {
      interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T>, ${
        component.name
      }Props {
      }
    }

    /** 
     * 
      ${getDescription(component)} 
      ${
        has(component.slots) && config.slotDocs
          ? `*
  * **Slots** 
 ${getSlotDocs(component)}`
          : "*"
      }
      ${
        has(component.events) && config.eventDocs
          ? `*
  * **Events** 
 ${getEventDocs(events)}`
          : "*"
      }
      */
    export declare function ${component.name}({children${
    params ? "," : ""
  } ${params}}: ${component.name}Props): JSX.Element;
  `;
}

function getDescription(component: Declaration) {
  const description = config.descriptionSrc
    ? component[config.descriptionSrc]
    : component.summary || component.description;

  return (
    description
      ?.split("\n")
      .map((y) => y.split("\\n").map((x) => ` * ${x}`))
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

function getPropsInterface(
  booleanAttributes: Attribute[],
  attributes: Attribute[],
  properties: Member[],
  events: EventName[]
) {
  return [
    "children?: any;",
    ...(booleanAttributes || []).map(
      (attr) => `
        /** ${attr.description} */
        ${toCamelCase(attr.name)}?: ${attr?.type?.text || "boolean"};
      `
    ),
    ...(attributes || []).map(
      (attr) => `
        /** ${attr.description} */
        ${toCamelCase(attr.name)}?: ${attr?.type?.text || "string"};
      `
    ),
    ...(properties || []).map(
      (prop) => `
        /** ${prop.description} */
        ${toCamelCase(prop.name)}?: ${prop?.type?.text || "string"};
      `
    ),
    ...events?.map(
      (event) => `
        /** ${event.description} */
        ${event.reactName}?: EventListenerOrEventListenerObject;
      `
    ),
  ]?.join("");
}

function getManifestContentTemplate(components: Declaration[]) {
  return components
    .map((component) => `export * from './${component.name}';`)
    .join("");
}
