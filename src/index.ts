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

export default function reactWrapper({
  exclude = [],
  attributeMapping = {},
  outdir = "react",
  typescript = true,
  modulePath,
}: Config = {}) {
  return {
    name: "cem-plugin-react-wrapper",
    packageLinkPhase(params: any) {
      createOutdir(outdir);
      console.log('EXCLUDE0', exclude);
      
      createWrappers(
        params.customElementsManifest,
        exclude,
        attributeMapping,
        outdir,
        typescript,
        modulePath
      );

    },
  };
}

export function createOutdir(outdir: string) {
  if (!fs.existsSync(outdir)) {
    fs.mkdirSync(outdir);
  }
}

export function createWrappers(
  customElementsManifest: CustomElementsManifest,
  exclude: string[],
  attributeMapping: { [key: string]: string },
  outdir: string,
  typescript: boolean,
  modulePath?: (className: string, tagName: string) => string
) {
  console.log('EXCLUDE1', exclude);
  
  const components = getComponents(customElementsManifest, exclude);

  components.forEach((component) => {
    const events = getEventNames(component);
    const { booleanAttributes, attributes } = getAttributes(
      component,
      attributeMapping
    );
    const properties = getFields(component);
    const componentModulePath = getModulePath(
      modulePath,
      component,
      outdir,
      packageJson
    );

    generateReactWrapper(
      component,
      events,
      booleanAttributes,
      attributes,
      properties,
      componentModulePath,
      outdir
    );

    if (typescript) {
      generateTypeDefinition(
        component,
        events,
        booleanAttributes,
        attributes,
        properties,
        componentModulePath,
        outdir
      );
    }
  });

  generateManifests(components, outdir, typescript);
}

function getComponents(
  customElementsManifest: CustomElementsManifest,
  exclude: string[]
) {
  console.log('EXCLUDE', exclude);
  
  return customElementsManifest.modules
    ?.map((mod) =>
      mod?.declarations?.filter(
        (dec: Declaration) =>
          exclude &&
          !exclude.includes(dec.name) &&
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
  componentModulePath: string,
  outdir: string
) {
  const result = getReactComponentTemplate(
    component,
    events,
    booleanAttributes,
    attributes,
    properties,
    componentModulePath
  );

  saveFile(outdir, `${component.name}.js`, result);
}

function generateTypeDefinition(
  component: Declaration,
  events: EventName[],
  booleanAttributes: Attribute[],
  attributes: Attribute[],
  properties: Member[],
  componentModulePath: string,
  outdir: string
) {
  const result = getTypeDefinitionTemplate(
    component,
    events,
    booleanAttributes,
    attributes,
    properties,
    componentModulePath
  );

  saveFile(outdir, `${component.name}.d.ts`, result);
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

function getFields(component: Declaration) {
  return component?.members?.filter(
    (member) =>
      member.kind === "field" &&
      !member.static &&
      member.privacy !== "private" &&
      member.privacy !== "protected" &&
      !member.attribute &&
      member.type
  );
}

function getEventNames(component: Declaration): EventName[] {
  return (
    component?.events?.map((event) => {
      return {
        name: event.name,
        reactName: createEventName(event),
      };
    }) || []
  );
}

function getAttributes(
  component: Declaration,
  attributeMapping: { [key: string]: string }
): ComponentAttributes {
  const result = {
    attributes: [],
    booleanAttributes: [],
  };

  component?.attributes?.forEach((attr) => {
    /** Handle reserved keyword attributes */
    if (RESERVED_WORDS.includes(attr?.name)) {
      /** If we have a user-specified mapping, rename */
      if (attr.name in attributeMapping) {
        const attribute = getMappedAttribute(attr, attributeMapping);
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
  booleanAttributes: Attribute[],
  attributes: Attribute[],
  properties: Member[],
  eventNames: EventName[]
) {
  return [
    ...[...(booleanAttributes || []), ...(attributes || [])].map((attr) =>
      toCamelCase(attr.name)
    ),
    ...properties.map((prop) => prop.name),
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
  if (attribute?.type?.text.includes("boolean")) {
    componentAttributes.booleanAttributes.push(attribute);
  } else {
    componentAttributes.attributes.push(attribute);
  }
}

function getMappedAttribute(
  attr: Attribute,
  attributeMapping: { [key: string]: string }
): MappedAttribute {
  return {
    ...attr,
    originalName: attr.name,
    name: attributeMapping[attr.name],
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
  return booleanAttributes?.map(
    (attr) => `
      useEffect(() => {
        if(${attr?.fieldName ?? attr.originalName} !== undefined) {
          if(${attr?.fieldName ?? attr.originalName}) {
            component?.setAttribute('${attr.fieldName}', '');
          } else {
            component?.removeAttribute('${attr.fieldName}');
          }
        }
      }, [${attr?.fieldName ?? attr.name}])
    `
  );
}

function getAttributeTemplates(attributes: MappedAttribute[]) {
  return attributes?.map(
    (attr) => `
      useEffect(() => {
        if(${
          attr?.fieldName ?? attr.originalName
        } !== undefined && component?.getAttribute('${
      attr?.originalName ?? attr.fieldName
    }') !== String(${attr?.fieldName ?? attr.originalName})) {
                  component?.setAttribute('${
                    attr?.originalName ?? attr.fieldName
                  }', String(${attr?.fieldName ?? attr.originalName}))
        }
      }, [${attr?.fieldName ?? attr.originalName}])
  `
  );
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
            .map((attr) =>
              !attr?.fieldName || attr?.name === attr?.fieldName
                ? attr?.name
                : `"${attr?.name}": ${attr?.fieldName}`
            )
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

    export declare function ${component.name}({children${
    params ? "," : ""
  } ${params}}: ${component.name}Props): JSX.Element;
  `;
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
      (attr) => `${toCamelCase(attr.name)}?: ${attr?.type?.text || "boolean"};`
    ),
    ...(attributes || []).map(
      (attr) => `${toCamelCase(attr.name)}?: ${attr?.type?.text || "string"};`
    ),
    ...(properties || []).map(
      (prop) => `${toCamelCase(prop.name)}?: ${prop?.type?.text || "string"};`
    ),
    ...events?.map(
      (event) => `${event.reactName}?: EventListenerOrEventListenerObject;`
    ),
  ]?.join("");
}

function getManifestContentTemplate(components: Declaration[]) {
  return components
    .map((component) => `export * from './${component.name}';`)
    .join("");
}
