import { LineAttributes, Paragraph, ParsedQuillDelta, RawQuillDelta, TextRun } from "quilljs-parser";


export interface LineAttr extends LineAttributes {
    citation?: boolean;
}

export interface QParagraph extends Paragraph {
    attributes?: LineAttr;
}

export type RawOrParsedDelta = RawQuillDelta | ParsedQuillDelta | RawQuillDelta[] | ParsedQuillDelta[];

export interface StyleInfo {
    font: string;
    fontSize: number;
    baseIndent: number;
    levelIndent: number;
    italics?: boolean;
    indent?: {
        left?: number;
        right?: number;
    };
}

export interface Style {
    [index: string]: StyleInfo;
    normal: StyleInfo;
    header_1: StyleInfo;
    header_2: StyleInfo;
    block_quote: StyleInfo;
    code_block: StyleInfo;
    list_paragraph: StyleInfo;
    citation: StyleInfo;
}

export interface StyleConfig {
    [index: string]: Partial<StyleInfo>;
    normal: Partial<StyleInfo>;
    header_1: Partial<StyleInfo>;
    header_2: Partial<StyleInfo>;
    block_quote: Partial<StyleInfo>;
    code_block: Partial<StyleInfo>;
    list_paragraph: Partial<StyleInfo>;
    citation: Partial<StyleInfo>;
}

export interface Config {
    styles?: Partial<StyleConfig>;
}

export interface TextBase {
    font: string;
    fontSize: number;
    indent?: number;
}

export type Runs = (TextRun | { formula: string})[];
