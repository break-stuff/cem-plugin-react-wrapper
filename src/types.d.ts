/**
 *
 * WRAPPER TYPES
 *
 */

export interface Config {
  exclude?: string[];
  attributeMapping?: { [key: string]: string };
  outdir?: string;
  typescript?: boolean;
  modulePath?: (className, tagName) => string;
}

export interface MappedAttribute extends Attribute {
  originalName?: string;
}

export interface ComponentAttributes {
  attributes: MappedAttribute[];
  booleanAttributes: MappedAttribute[];
}

export interface EventName {
  name: string;
  reactName: string;
}

declare module '@custom-elements-manifest/analyzer/src/create.js';

/**
 *
 * CEM TYPES
 *
 */

export interface CustomElementsManifest {
  schemaVersion: string;
  readme: string;
  modules: Module[];
}

interface Module {
  kind: "javascript-module";
  path: "src/calendar/calendar.ts";
  declarations: Declaration[];
  exports: [
    {
      kind: "js";
      name: "DiaCalendar";
      declaration: {
        name: "DiaCalendar";
        module: "src/calendar/calendar.ts";
      };
    },
    {
      kind: "custom-element-definition";
      name: "dia-calendar";
      declaration: {
        name: "DiaCalendar";
        module: "src/calendar/calendar.ts";
      };
    }
  ];
}

export interface Declaration {
  kind: string;
  description: string;
  name: string;
  cssProperties: CssProperty[];
  cssParts: CssPart[];
  slots: Slot[];
  members: Member[];
  events: Event[];
  attributes: Attribute[];
  superclass: SuperClass;
  tagName: string;
  summary: string;
  customElement: boolean;
}
interface CssProperty {
  description: string;
  name: string;
  default: string;
}

interface CssPart {
  description: string;
  name: string;
}

interface Slot {
  description: string;
  name: string;
}

interface Member {
  kind: string;
  name: string;
  type: Type;
  default?: string;
  description: string;
  attribute: string;
  reflects?: boolean;
  privacy?: string;
  parameters?: Parameter[];
  return?: Return;
  static?: boolean;
}

interface Type {
  text: string;
}

interface Parameter {
  name: string;
  type: Type;
}

interface Return {
  type: Type;
}

interface Event {
  name: string;
  type: Type;
  description: string;
}

interface Attribute {
  name: string;
  type: Type;
  default?: string;
  description: string;
  fieldName: string;
}

interface SuperClass {
  name: string;
  package: string;
}
