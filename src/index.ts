import fs from "fs";
import path from "path";
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
} from "./utils.js";

const packageJsonPath = path.join(process.cwd(), "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath).toString());

export default function reactWrapper({
  exclude = [],
  attributeMapping = {},
  outdir = "react",
  typescript = false,
  modulePath,
}: Config) {
  return {
    name: "cem-plugin-react-wrapper",
    packageLinkPhase(params: any) {
      const customElementsManifest: CustomElementsManifest =
        params.customElementsManifest;
      if (!fs.existsSync(outdir)) {
        fs.mkdirSync(outdir);
      }

      const components: Declaration[] = [];
      customElementsManifest.modules?.forEach((mod) => {
        mod?.declarations?.forEach((dec: Declaration) => {
          if (
            exclude &&
            !exclude.includes(dec.name) &&
            (dec.customElement || dec.tagName)
          ) {
            components.push(dec);
          }
        });
      });

      components.forEach((component) => {
        const events = getEventNames(component);
        const { booleanAttributes, attributes } = setAttributes(
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
        const result = getReactComponentTemplate(
          component,
          events,
          booleanAttributes,
          attributes,
          properties,
          componentModulePath
        );

        saveFile(outdir, `${component.name}.js`, result);

        if (typescript) {
          const result = getTypeDefinitionTemplate(
            component,
            events,
            booleanAttributes,
            attributes,
            properties,
            outdir
          );

          saveFile(outdir, `${component.name}.d.ts`, result);
        }
      });

      saveFile(outdir, "index.js", getManifestContentTemplate(components));

      if (typescript) {
        saveFile(outdir, "index.d.ts", getManifestContentTemplate(components));
      }
    },
  };
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

function setAttributes(
  component: Declaration,
  attributeMapping: { [key: string]: string }
): ComponentAttributes {
  const result = {
    attributes: [],
    booleanAttributes: [],
  };

  component?.attributes
    ?.filter((attr) => attr.fieldName)
    ?.forEach((attr) => {
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
    ...properties.map(prop => prop.name),
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
          ${useEffect ? 'ref,' : ""} 
          ${[...booleanAttributes, ...attributes]
            .map((attr) =>
              attr?.name === attr?.fieldName
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
      (attr) => `${toCamelCase(attr.name)}?: ${attr?.type?.text || 'boolean'};`
    ), 
    ...(attributes || []).map(
      (attr) => `${toCamelCase(attr.name)}?: ${attr?.type?.text || 'string'};`
    ),
    ...(properties || []).map(
      (prop) => `${toCamelCase(prop.name)}?: ${prop?.type?.text || 'string'};`
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
