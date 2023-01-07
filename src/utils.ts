import path from "path";
import prettier from "prettier";
import fs from "fs";
import { Declaration } from "./types";

export function getPackageJson(): any {
  const packageJsonPath = path.join(process.cwd(), "package.json");
  return JSON.parse(fs.readFileSync(packageJsonPath).toString());
}

export function getModulePath(
  modulePath: ((className: string, tagName: string) => string) | undefined,
  component: Declaration,
  outdir: string,
  packageJson: any
) {
  if (modulePath instanceof Function) {
    return modulePath(component.name, component.tagName);
  }

  if (!packageJson.module) {
    throw new Error(
      "You must define a module path in order to generate React wrappers."
    );
  }

  const directories = outdir?.split("/");
  return path.join(directories.map((_) => "../").join(""), packageJson.module);
}

export function saveFile(outdir: string, fileName: string, contents: string) {
  fs.writeFileSync(
    path.join(outdir, fileName),
    prettier.format(contents, { parser: "typescript" })
  );
}

export function toCamelCase(value: string = "") {
  const arr = value.split("-");
  const capital = arr.map((item, index) =>
    index
      ? item.charAt(0).toUpperCase() + item.slice(1).toLowerCase()
      : item.toLowerCase()
  );
  return capital.join("");
}

export function capitalizeFirstLetter(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export const createEventName = (event: any) =>
  `on${capitalizeFirstLetter(toCamelCase(event.name))}`;

export const has = (arr: any[]) => Array.isArray(arr) && arr.length > 0;

export const RESERVED_WORDS = [
  "children",
  "localName",
  "ref",
  "style",
  "className",
  "abstract",
  "arguments",
  "await",
  "boolean",
  "break",
  "byte",
  "case",
  "catch",
  "char",
  "class",
  "const",
  "continue",
  "debugger",
  "default",
  "delete",
  "do",
  "double",
  "else",
  "enum",
  "eval",
  "export",
  "extends",
  "false",
  "final",
  "finally",
  "float",
  "for",
  "function",
  "goto",
  "if",
  "implements",
  "import",
  "in",
  "instanceof",
  "int",
  "interface",
  "let",
  "long",
  "native",
  "new",
  "null",
  "package",
  "private",
  "protected",
  "public",
  "return",
  "short",
  "static",
  "super",
  "switch",
  "synchronized",
  "this",
  "throw",
  "throws",
  "transient",
  "true",
  "try",
  "typeof",
  "var",
  "void",
  "volatile",
  "while",
  "with",
  "yield",
];

export function saveReactUtils(outdir: string) {
  const reactUtils = `
import { useEffect } from 'react';

export function useAttribute(targetElement, attrName, value) {
  useEffect(() => {
    if (value !== undefined && attrName !== 'style' && targetElement.current?.getAttribute(attrName) !== String(value)) {
      targetElement.current?.setAttribute(attrName, String(value));
    }
  }, [value]);
}

export function useBooleanAttribute(targetElement, attrName, propName) {
  useEffect(() => {
    if (propName !== undefined) {
      if (propName) {
        targetElement.current?.setAttribute(attrName, '');
      } else {
        targetElement.current?.removeAttribute(attrName);
      }
    }
  }, [propName]);
}

export function useProperties(targetElement, propName, value) {
  useEffect(() => {
    if (value !== undefined && targetElement.current[propName] !== value) {
      targetElement.current[propName] = value;
    }
  }, [value]);
}

export function useEventListener(targetElement, eventName, eventHandler) {
  useEffect(() => {
    if (eventHandler !== undefined) {
      targetElement.current.addEventListener(eventName, eventHandler);
    }

    return () => {
      if (eventHandler?.cancel) {
        eventHandler.cancel();
      }

      if (targetElement?.current?.removeEventListener) {
        targetElement.current.removeEventListener(eventName, eventHandler);
      }
    };
  }, [eventName, eventHandler, targetElement]);
}

`;

  saveFile(outdir, "react-utils.js", reactUtils);
}
