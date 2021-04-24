export type Options = {
  outputPath: string;
  themeDomain: string;
};

export type VisitorState = {
  file: any;
  opts: Partial<Options>;
  extractedString: string[];
};

export type OutputState = {
  translations: string[];
  options: Partial<Options>;
  add: (val: string) => void;
  export: (filePath: string, themeDomain: string, strings: string[]) => void;
};

export type Exporter = (
  filePath: string,
  themeDomain: string,
  strings: string[]
) => void;
