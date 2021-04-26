import * as BabelCore from "@babel/core";
import * as fs from "fs";
import { Exporter, VisitorState } from "./types";

const output: string[] = [];

const exporter: Exporter = (filePath, themeDomain, strings) => {
  const sortByName = (arr: string[]) => arr.sort((a, b) => a.localeCompare(b));
  const sortedStrings = sortByName(strings);
  const translations = sortedStrings
    .map((s) => {
      const str = s.replace("'", "\\'");
      return `'${str}' => __('${str}', '${themeDomain}'),\n`;
    })
    .join("");

  const data = `<?php\nreturn [\n${translations}];\n?>`;
  fs.writeFileSync(filePath, data, {
    encoding: "utf-8",
  });
};

export default (): BabelCore.PluginObj<VisitorState> => ({
  visitor: {
    CallExpression(path, state) {
      const callee = path.get("callee");
      if (!callee.isIdentifier()) return;
      if (callee.node.name !== "t") return;
      if (path.node.arguments[0].type !== "StringLiteral") return;

      const translationString = path.node.arguments[0].value;
      const finder = (x: string) => x == translationString;
      if (output.findIndex(finder) > -1) return;

      output.push(translationString);
    },
  },
  post(state) {
    const opts = this.opts;
    const outputPath = opts.outputPath || "./languages/wp-translations.php";
    const themeDomain = opts.themeDomain || "themedomain";
    exporter(outputPath, themeDomain, output);
  },
});
