import { reactWrapper } from "./index.js";

export default {
  /** Globs to analyze */
  globs: ["demo/components/*.js"],
  /** Directory to output CEM to */
  outdir: "./",
  /** Run in dev mode, provides extra logging */
  dev: false,
  /** Run in watch mode, runs on file changes */
  watch: false,
  /** Include third party custom elements manifests */
  dependencies: true,
  /** Output CEM path to `package.json`, defaults to true */
  packagejson: false,
  /** Provide custom plugins */
  plugins: [reactWrapper({ 
    outdir: "./demo/wrapped-components",
    modulePath: (className, tagName) => `../components/${tagName}.js`
 })],
};
