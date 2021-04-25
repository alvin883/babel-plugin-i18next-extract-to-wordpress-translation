import path from "path";
import { transformFileSync } from "@babel/core";
import plugin from "../src";
import fs from "fs";
import { Options } from "../src/types";

const testPath = (p: string) => path.join(__dirname, "./__fixtures__/", p);

function transform(filePath: string, options: Partial<Options>) {
  return transformFileSync(filePath, {
    babelrc: false,
    configFile: false,
    plugins: [[plugin, options]],
  })?.code;
}

describe("Basic check", () => {
  it("should pass", () => {
    const expectedOutput = (() => {
      if (fs.existsSync(testPath("use-translation.php"))) {
        return fs.readFileSync(testPath("use-translation.php"), {
          encoding: "utf-8",
        });
      } else {
        return "";
      }
    })();

    transform(testPath("use-translation.js"), {
      outputPath: testPath("use-translation.php"),
    });

    const output = fs.readFileSync(testPath("use-translation.php"), {
      encoding: "utf-8",
    });

    expect(output).toBe(expectedOutput);
  });
});
