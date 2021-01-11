import { ParsedQuillDelta, RawQuillDelta, TextRun } from "quilljs-parser";

export type RawOrParsedDelta = RawQuillDelta | ParsedQuillDelta | RawQuillDelta[] | ParsedQuillDelta[];

export interface Config {
    exportAs: 'blob' | 'pdfKit';
}

export interface TextBase {
    font: string;
    fontSize: number;
    indent?: number;
}

export type Runs = (TextRun | { formula: string})[];
