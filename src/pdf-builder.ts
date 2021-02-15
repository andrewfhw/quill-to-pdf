import PDFDocument from './pdfkit.standalone';
import BlobStream from './blob-stream';
import { letters, numbers, roman, styles } from "./default-styles";
import { Config, LineAttr, QParagraph, RawOrParsedDelta, Runs, Style, StyleConfig, StyleInfo, TextBase } from "./interfaces";
import { InsertEmbed, ParsedQuillDelta, parseQuillDelta, RawQuillDelta, RunAttributes, TextRun } from 'quilljs-parser';

class PdfBuilder {

    // what indicator type is used for each of the 6 levels of ordered lists
    listIndicators: string[][];

    // array used to track the current indicator for each level of ordered lists
    levelTrackers: number[];

    // the default text styles
    style: Style;

    constructor() {
        this.style = Object.assign({}, styles);
        this.levelTrackers = [0, 0, 0, 0, 0, 0];
        this.listIndicators = [numbers, letters, roman, numbers, letters, roman];
    }


    // Starts the PDF stream which will contain the PDF document output
    getPdfStream(doc: any, delta: RawOrParsedDelta, config?: Config) {
        this.resetLevelTrackers();
        this.resetStyles();
        if (config && config.styles) {
            this.configureStyles(config);
        }
        const parsed = this.prepareInput(delta);
        doc = new PDFDocument() as any;
        const stream = doc.pipe(BlobStream() as any);
        this.buildPdf(parsed, doc);
        doc.end();
        return stream;
    }


    // *** BUILD THE PDF ***

    // This is the starting point for building the PDF output
    // It sends each paragraph of each delta out for processing.
    buildPdf(parsedDeltas: ParsedQuillDelta[], doc: any): void {
        for (const delta of parsedDeltas) {
            for (const paragraph of delta.paragraphs) {
                this.buildParagraph(paragraph, doc);
            };
        };
    }


    // This is the first step for every paragraph in the document
    // This routes paragraphs to the appropriate handler based on whether
    // the paragraph is an embed, formatted, or not formatted.
    buildParagraph(paragraph: QParagraph, doc: any): void {
        doc.moveDown();
        // handle embeds
        if (paragraph.embed) {
            this.resetLevelTrackers();
            this.buildEmbed(paragraph.embed, doc);
        // handle paragraphs with line attributes
        } else if (paragraph.attributes) {
            this.buildFormattedParagraphs(paragraph, doc);
        // no paragraph formatting
        } else {
            this.resetLevelTrackers();
            this.buildSimpleParagraphs(paragraph, doc);
        }
    }

    // handles video and image embeds
    buildEmbed(embed: InsertEmbed, doc: any) {
        doc.moveDown();
        if (embed.image) {
            doc.image(embed.image, { fit: [200, 200], align: 'center' });
        } else if (embed.video) {
            doc.font(this.style.normal.font);
            doc.fontSize(this.style.normal.fontSize);
            doc.fillColor('blue');
            doc.text(embed.video, this.style.normal.baseIndent ? this.style.normal.baseIndent :  72, null, {
                underline: false,
                strike: false,
                oblique: false,
                link: embed.video,
                continued: false
            });
        }
    }


    // *** BUILD SIMPLE PARAGRAPHS ***
    // This function builds paragraphs that DO NOT contain paragraph-level formatting.

    // handle all unformatted paragraphs
    buildSimpleParagraphs(paragraph: QParagraph, doc: any): void {
        const baseIndent = this.style.normal.baseIndent;
        this.buildRuns(paragraph.textRuns as TextRun[], {
            font: this.style.normal.font,
            fontSize: this.style.normal.fontSize,
            indent: baseIndent
        }, doc);
    };


    // *** BUILD FORMATTED PARAGRAPHS ***
    // These functions handle text that contains paragraph-level formatting.

    // handles all formatted paragraphs; routes paragraph to appropriate handler
    buildFormattedParagraphs(paragraph: QParagraph, doc: any) {
        const lineAttributes = paragraph.attributes;
        if (!lineAttributes) {
            throw new Error('Something went wrong.');
        }
        if (lineAttributes.header) {
            this.resetLevelTrackers();
            this.buildHeader(paragraph.textRuns as Runs, lineAttributes.header, doc);
        }
        if (lineAttributes.blockquote) {
            this.resetLevelTrackers();
            this.buildBlockQuote(paragraph.textRuns as Runs, doc);
        }
        if (lineAttributes['code-block']) {
            this.resetLevelTrackers();
            this.buildCodeBlock(paragraph.textRuns as Runs, doc);
        }
        if (lineAttributes.list) {
            this.buildList(paragraph.textRuns as Runs, paragraph.attributes as LineAttr, doc);
        }
        if (lineAttributes.citation) {
            this.resetLevelTrackers();
            this.buildCitation(paragraph.textRuns as Runs, paragraph.attributes as LineAttr, doc);
        }
    }

    // builds paragraphs with header formatting
    buildHeader(textRuns: Runs, level: number, doc: any): void {
        if (level === 1) {
            this.buildRuns(textRuns, {
                font: this.style.header_1.font,
                fontSize: this.style.header_1.fontSize,
                indent: this.style.header_1.baseIndent
            }, doc);
        } else if (level === 2) {
            this.buildRuns(textRuns, {
                font: this.style.header_2.font,
                fontSize: this.style.header_2.fontSize,
                indent: this.style.header_2.baseIndent
            }, doc);
        }
    };


    // builds paragraphs with blockquote formatting
    buildBlockQuote(textRuns: Runs, doc: any): void {
        this.buildRuns(textRuns, {
            font: this.style.block_quote.font,
            fontSize: this.style.block_quote.fontSize,
            indent: this.style.block_quote.baseIndent
        }, doc);
    };


    // builds paragraphs with code block formatting
    buildCodeBlock(textRuns: Runs, doc: any): void {
        this.buildRuns(textRuns, {
            font: this.style.code_block.font,
            fontSize: this.style.code_block.fontSize,
            indent: this.style.code_block.baseIndent
        }, doc);
    };


    // builds paragraphs with list formatting
    buildList(textRuns: Runs, lineAttributes: LineAttr, doc: any): void {
        if (lineAttributes.list === 'bullet') {
            this.resetLevelTrackers();
            this.buildBulletList(textRuns, lineAttributes, doc);
        } else {
            this.buildOrderedList(textRuns, lineAttributes, doc);
        }
    };


    // builds ordered lists; updates tracking
    buildOrderedList(textRuns: Runs, lineAttributes: LineAttr, doc: any): void {
        doc.font(this.style.list_paragraph.font);
        doc.fontSize(this.style.list_paragraph.fontSize);
        doc.fillColor('black');
        let baseIndent = this.style.list_paragraph.baseIndent;
        let levelIndent = this.style.list_paragraph.levelIndent;
        let level = (lineAttributes.indent ? lineAttributes.indent : 0) + 1;
        doc.text(this.getListIndicator(level - 1) + '.', baseIndent + (levelIndent * level), null, {
            width: (72*6.5)-(3+(baseIndent)+levelIndent*level),
            continued: false
        });
        doc.moveUp();
        this.buildRuns(textRuns, {
            font: this.style.list_paragraph.font,
            fontSize: this.style.list_paragraph.fontSize,
            indent: baseIndent + levelIndent + 3 + (levelIndent * level)
        }, doc);
    };


    // builds unordered lists
    buildBulletList(textRuns: Runs, lineAttributes: LineAttr, doc: any): void {
        doc.font(this.style.list_paragraph.font);
        doc.fontSize(this.style.list_paragraph.fontSize);
        doc.fillColor('black');
        let baseIndent = this.style.list_paragraph.baseIndent;
        let levelIndent = this.style.list_paragraph.levelIndent;
        let level = (lineAttributes.indent ? lineAttributes.indent : 0 ) + 1;
        doc.text('\u2022', baseIndent + (levelIndent * level), null, {
            width: (72*6.5)-(3+(baseIndent)+levelIndent*level),
            continued: false
        });
        doc.moveUp();
        this.buildRuns(textRuns, {
            font: this.style.list_paragraph.font,
            fontSize: this.style.list_paragraph.fontSize,
            indent: baseIndent + levelIndent + 3 + (levelIndent * level)
        }, doc);
    };


    buildCitation(textRuns: Runs, lineAttributes: LineAttr, doc: any): void {
        this.buildRuns(textRuns, {
            font: this.style.citation.font,
            fontSize: this.style.citation.fontSize,
            indent: this.style.citation.baseIndent
        }, doc);
    }

    // *** BUILDING TEXT RUNS ***
    // These functions actually insert text into the PDF document
    // They are essentially the lowest-level functions

    // inserts text for each run
    buildRuns(textRuns: Runs, base: TextBase, doc: any): void {
        let runTracker = 0;
        for (const run of textRuns) {
            doc.font(base.font);
            doc.fontSize(base.fontSize);
            this.setPreRunAttributes((run as TextRun).attributes, base, doc);
            doc.text(
                (run as TextRun).text ? (run as TextRun).text : (run as {formula: string}).formula, // text content
                base.indent ? base.indent : 72, // left indent (x)
                null, // vertical spacing (y)
                this.setRunAttributes( // formatting object
                    (run as TextRun).attributes,
                    runTracker === textRuns.length-1));
            runTracker++;
        };
    };


    // sets formatting attributes that must occur before the doc.text() call
    setPreRunAttributes(runAttributes: RunAttributes | undefined, base: TextBase, doc: any): void {
        if (runAttributes?.size) {
            this.setRunSize(runAttributes.size, base.fontSize, doc);
        }
        if (runAttributes?.bold) {
            this.setBoldFont(base.font, doc);
        }
        runAttributes?.color ? doc.fillColor(runAttributes.color) : runAttributes?.link ? doc.fillColor('blue') : doc.fillColor('black');
    };


    // setting formatting attributes that must occur in the doc.text() options argument
    setRunAttributes(attributes: RunAttributes | undefined, lastRun: boolean): object {
        return {
            underline: attributes?.underline ? true : false,
            strike: attributes?.strike ? true : false,
            oblique: attributes?.italic ? true : false,
            link: attributes?.link ? attributes.link : null,
            continued: !lastRun
        };
    };

    // adjusts the run size based on the base size
    setRunSize(size: 'small' | 'large' | 'huge', baseSize: number, doc: any): void {
        switch (size) {
            case 'small':
                doc.fontSize(baseSize - 4);
                break;
            case 'large':
                doc.fontSize(baseSize + 4);
                break;
            case 'huge':
                doc.fontSize(baseSize + 6);
                break;
        };
    };

    // sets font to bold based on current active base font
    setBoldFont(baseFont: string, doc: any): void {
        switch (baseFont) {
            case 'Times-Roman':
                doc.font('Times-Bold');
                break;
            case 'Courier':
                doc.font('Courier-Bold');
                break;
            case 'Helvetica':
                doc.font('Helvetica-Bold');
                break;
        };
    };


    // *** SET UP AND CONFIGURATION ***

    // prepares the input data to be processed by the pdf builder
    prepareInput(delta: RawOrParsedDelta): ParsedQuillDelta[] {
        // handle array of deltas
        if (Array.isArray(delta)) {
            // handle array of raw deltas
            if ((delta as RawQuillDelta[])[0].ops) {
                const parsedDeltas: ParsedQuillDelta[] = [];
                for (const rawDelta of delta) {
                    const parsed = parseQuillDelta(rawDelta as RawQuillDelta);
                    parsedDeltas.push(parsed);
                };
                return parsedDeltas;
            // handle array of parsed deltas
            } else if ((delta as ParsedQuillDelta[])[0].paragraphs) {
                return delta as ParsedQuillDelta[];
            // handle array of invalid elements
            } else {
                throw new Error('Array must contain raw or parsed deltas only.');
            }
        // handle single delta
        } else {
            // handle single raw delta
            if ((delta as RawQuillDelta).ops) {
                const parsed = parseQuillDelta(delta as RawQuillDelta);
                return [parsed];
            // handle single parsed delta
            } else if ((delta as ParsedQuillDelta).paragraphs) {
                return [delta as ParsedQuillDelta];
            // handle invalid input
            } else {
                throw new Error('Must provide a raw or parsed delta.');
            }
        }
    }

    // Overrides the default styles with user-provided styles
    configureStyles(config: Config) {
        if (!config.styles) {
            throw new Error('No style keys found.');
        }
        for (const key of Object.keys(config.styles)) {
            const keyValue = config.styles[key];
            if (keyValue !== undefined) {
                if (this.style[key]) {
                    const defaultStyle = Object.assign({}, this.style[key]);
                    const customStyle = Object.assign({}, config.styles[key]);
                    const merged = Object.assign(defaultStyle, customStyle);
                    this.style[key] = merged;
                } else {
                    this.style[key] = keyValue as StyleInfo;
                }
            }
        };
    }

    // sets the styles back to their defaults
    resetStyles() {
        this.style = Object.assign({}, styles);
    }


    // *** HELPERS FOR ORDERED LISTS ***

    // resets ordered list back to original state (all levels at 0)
    resetLevelTrackers(): void {
        let index = 0;
        for (let tracker of this.levelTrackers) {
            this.levelTrackers[index] = 0;
            index++;
        };
    }

    // updates the active ordered list indicators
    updateLevelTrackers(level: number) {
        let index = 0;
        for (let tracker of this.levelTrackers) {
            // this level should remain unchanged
            if (index < level) {
                this.levelTrackers[index] = tracker;
            // this level should increment one
            } else if (index === level) {
                this.levelTrackers[index] = tracker + 1;
            // this level should reset to zero
            } else {
                this.levelTrackers[index] = 0
            }
        index++;
        };
    }

    // returns the appropriate ordered list indicator; updates tracking
    getListIndicator(level: number): string {
        let listIndicator = this.listIndicators[level][this.levelTrackers[level]];
        this.updateLevelTrackers(level);
        return listIndicator;
    }

}

export default PdfBuilder;