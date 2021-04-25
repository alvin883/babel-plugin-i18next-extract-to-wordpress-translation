export type Options = {
  outputPath: string;
  themeDomain: string;
};

export type VisitorState = {
  file: any;
  opts: Partial<Options>;
  extractedString: string[];
};

export type Exporter = (
  filePath: string,
  themeDomain: string,
  strings: string[]
) => void;
