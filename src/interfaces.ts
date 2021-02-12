import { LineAttributes, Paragraph, ParsedQuillDelta, RawQuillDelta, TextRun } from "quilljs-parser";


export interface LineAttr extends LineAttributes {
    citation?: boolean;
}

export interface QParagraph extends Paragraph {
    attributes?: LineAttr;
}

export type RawOrParsedDelta = RawQuillDelta | ParsedQuillDelta | RawQuillDelta[] | ParsedQuillDelta[];

export interface RequiredStyleInfo {
    font: string;
    fontSize: number;
    baseIndent: number;
    levelIndent: number;
    italics?: boolean;
    indent?: {
        left: number;
        right: number;
    };
}

export interface StyleConfig {
    normal: RequiredStyleInfo;
    header_1: RequiredStyleInfo;
    header_2: RequiredStyleInfo;
    block_quote: RequiredStyleInfo;
    code_block: RequiredStyleInfo;
    list_paragraph: RequiredStyleInfo;
    citation: RequiredStyleInfo;
}

export interface Config {
    exportAs: 'blob' | 'pdfKit';
    styles?: Partial<StyleConfig>;
}

export interface TextBase {
    font: string;
    fontSize: number;
    indent?: number;
}

export type Runs = (TextRun | { formula: string})[];
