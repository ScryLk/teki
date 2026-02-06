declare module 'pdf-parse' {
  interface LoadParameters {
    url?: string | URL;
    data?: string | number[] | ArrayBuffer | Uint8Array;
    verbosity?: number;
    [key: string]: unknown;
  }

  interface ParseParameters {
    partial?: number[];
    first?: number;
    last?: number;
    pageJoiner?: string;
    [key: string]: unknown;
  }

  interface TextResult {
    pages: Array<{ num: number; text: string }>;
    text: string;
    total: number;
    getPageText(num: number): string;
  }

  class PDFParse {
    constructor(options: LoadParameters);
    getText(params?: ParseParameters): Promise<TextResult>;
    destroy(): Promise<void>;
  }

  export { PDFParse, LoadParameters, ParseParameters, TextResult };
}
