import * as BabelCore from "@babel/core";
import * as fs from "fs";
import * as path from "path";
import axios from "axios";
import { PHPExporter, URLExporter, VisitorState } from "./types";

const output: string[] = [];

const sortByName = (arr: string[]) => arr.sort((a, b) => a.localeCompare(b));

const phpExporter: PHPExporter = (filePath, themeDomain, strings) => {
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

const urlExporter: URLExporter = (url, strings) => {
  const sortedStrings = sortByName(strings);
  const translations = sortedStrings.reduce((p, s) => ({ ...p, [s]: s }), {});
  axios.post(url, translations);
};

/**
 * Check is valid URL or not
 * regex taken from: https://github.com/arasatasaygin/is.js/blob/master/is.js#L347
 * @param str
 */
const isURL = (str: string): boolean => {
  return /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/i.test(
    str
  );
};

export default (): BabelCore.PluginObj<VisitorState> => ({
  visitor: {
    CallExpression(path, state) {
      const callee = path.get("callee");
      if (!callee.isIdentifier()) return;
      if (callee.node.name !== "t") return;
      if (!path.node.arguments || !path.node.arguments.length) return;
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
    const isPHPFile = path.extname(outputPath) === ".php";

    if (isPHPFile) {
      phpExporter(outputPath, themeDomain, output);
    } else if (isURL(outputPath)) {
      urlExporter(outputPath, output);
    } else {
      throw Error(
        "babel-plugin-i18next-extract-to-wordpress-translation only support PHP and URL exporter. Please configure outputPath to be PHP file or a URL"
      );
    }
  },
});
