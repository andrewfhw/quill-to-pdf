import { ParsedQuillDelta, RawQuillDelta } from "quilljs-parser";

export type RawOrParsedDelta = RawQuillDelta | ParsedQuillDelta | RawQuillDelta[] | ParsedQuillDelta[];

export interface Config {

}

export interface TextBase {
    font: string;
    fontSize: number;
    indent?: number;
}
