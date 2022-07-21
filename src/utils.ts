import path from "path";
import prettier from "prettier";
import fs from "fs";

export function getModulePath(outdir: string, packageJson: any) {
  const directories = outdir.split("/");
  return path.join(directories.map((_) => "../").join(""), packageJson.module);
}

export function saveFile(outdir: string, fileName: string, contents: string) {
  fs.writeFileSync(
    path.join(outdir, fileName),
    prettier.format(contents, { parser: "typescript" })
  );
}

export function toCamelCase(value: string) {
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
