export type Options = {
  outputPath: string;
  themeDomain: string;
};

export type VisitorState = {
  file: any;
  opts: Partial<Options>;
  extractedString: string[];
};

export type URLExporter = (
  url: string,
  strings: string[]
) => void;

export type PHPExporter = (
  filePath: string,
  themeDomain: string,
  strings: string[]
) => void;
