import * as BabelCore from "@babel/core";
import * as fs from "fs";
import { Exporter, VisitorState } from "./types";

const exporter: Exporter = (filePath, themeDomain, strings) => {
  const translations = strings
    .map((s) => `'${s}' => __('${s}', '${themeDomain}'),\n`)
    .join("");

  const data = `<?php\nreturn [\n${translations}];\n?>`;
  fs.writeFileSync(filePath, data, { encoding: "utf-8" });
};

export default (): BabelCore.PluginObj<VisitorState> => ({
  pre(state) {
    this.extractedString = [];
  },
  visitor: {
    CallExpression(path, state) {
      const callee = path.get("callee");
      if (!callee.isIdentifier()) return;
      if (callee.node.name !== "t") return;
      if (path.node.arguments[0].type !== "StringLiteral") return;

      const translationString = path.node.arguments[0].value;
      state.extractedString.push(translationString);
    },
  },
  post(state) {
    const opts = this.opts;
    const outputPath = opts.outputPath || "/languages/wp-translations.php";
    const themeDomain = opts.themeDomain || "themedomain";
    exporter(outputPath, themeDomain, this.extractedString);
  },
});
