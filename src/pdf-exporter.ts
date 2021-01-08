import PDFDocument from './pdfkit.standalone';
import BlobStream from './blob-stream';
import { RawQuillDelta, ParsedQuillDelta, parseQuillDelta, Paragraph, TextRun, InsertEmbed, RunAttributes, LineAttributes } from 'quilljs-parser';
import { Config, RawOrParsedDelta, Runs, TextBase } from './interfaces';
import { saveAs } from 'file-saver';
import { letters, numbers, roman, styles } from './default-styles';

// a top-level variable to hold pdf doc
let doc: any;

// what indicator type is used for each of the 6 levels of ordered lists
const listIndicators = [numbers, letters, roman, numbers, letters, roman];

// array used to track the current indicator for each level of ordered lists
const levelTrackers: number[] = [0, 0, 0, 0, 0, 0];

// resets ordered list back to original state (all levels at 0)
function resetLevelTrackers(): void {
    let index = 0;
    for (let tracker of levelTrackers) {
        levelTrackers[index] = 0;
        index++;
    };
};

// updates the active ordered list indicators
function updateLevelTrackers(level: number) {
    let index = 0;
    for (let tracker of levelTrackers) {
        // this level should remain unchanged
        if (index < level) {
            levelTrackers[index] = tracker;
        // this level should increment one
        } else if (index === level) {
            levelTrackers[index] = tracker + 1;
        // this level should reset to zero
        } else {
            levelTrackers[index] = 0;
        }
        index++;
    }
}

// returns the appropriate ordered list indicator; updates tracking
function getListIndicator(level: number): string {
    let listIndicator = listIndicators[level][levelTrackers[level]];
    updateLevelTrackers(level);
    return listIndicator;
};

// main function for package; called by user
export function generatePdf(delta: RawOrParsedDelta, config?: Config): void {
    doc = undefined;
    resetLevelTrackers();
    const parsed = prepareInput(delta);
    doc = new PDFDocument() as any;
    const stream = doc.pipe(BlobStream() as any);
    buildPdf(parsed);
    doc.end();
    stream.on('finish', () => {
        const blob = stream.toBlob('application/pdf');
        saveAs(blob, 'pdf-export.pdf');
    });
};

// prepare input deltas for processing to PDF
function prepareInput(delta: RawOrParsedDelta): ParsedQuillDelta[] {
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
        } else if ((delta as ParsedQuillDelta)) {
            return [delta as ParsedQuillDelta];
        // handle invalid input
        } else {
            throw new Error('Must provide a raw or parsed delta.');
        }
    }
};

// builds the PDF document
function buildPdf(parsedDeltas: ParsedQuillDelta[]): void {
    for (const delta of parsedDeltas) {
        for (const paragraph of delta.paragraphs) {
            buildParagraph(paragraph);
        };
    };
};

// builds paragraphs; first fn called on paragraph inputs
function buildParagraph(paragraph: Paragraph): void {
    doc.moveDown();
    // handle embeds
    if (paragraph.embed) {
        resetLevelTrackers();
        buildEmbed(paragraph.embed);
    // handle paragraphs with line attributes
    } else if (paragraph.attributes) {
        buildFormattedParagraphs(paragraph);
    // no paragraph formatting
    } else {
        resetLevelTrackers();
        buildSimpleParagraphs(paragraph);
    }
};

// handles video and image embeds
function buildEmbed(embed: InsertEmbed) {
    doc.moveDown();
    if (embed.image) {
        doc.image(embed.image, { fit: [200, 200], align: 'center' });
    } else if (embed.video) {
        doc.font(styles.normal.font);
        doc.fontSize(styles.normal.fontSize);
        doc.text(embed.video, {
            continued: false
        });
    }
}

// handles all formatted paragraphs
function buildFormattedParagraphs(paragraph: Paragraph): void {
    const lineAttributes = paragraph.attributes;
    if (!lineAttributes) {
        throw new Error('Something went wrong.');
    }
    if (lineAttributes.header) {
        resetLevelTrackers();
        buildHeader(paragraph.textRuns as Runs, lineAttributes.header);
    }
    if (lineAttributes.blockquote) {
        resetLevelTrackers();
        buildBlockQuote(paragraph.textRuns as Runs);
    }
    if (lineAttributes['code-block']) {
        resetLevelTrackers();
        buildCodeBlock(paragraph.textRuns as Runs);
    }
    if (lineAttributes.list) {
        buildList(paragraph.textRuns as Runs, paragraph.attributes as LineAttributes);
    }
};

// handle all unformatted paragraphs
function buildSimpleParagraphs(paragraph: Paragraph): void {
    doc.font(styles.normal.font);
    doc.fontSize(styles.normal.fontSize);
    buildRuns(paragraph.textRuns as TextRun[], {
        font: styles.normal.font,
        fontSize: styles.normal.fontSize
    });
};

// HANDLING PARAGRAPHS WITH LINE ATTRIBUTES

// builds paragraphs with header formatting
function buildHeader(textRuns: Runs, level: number): void {
    if (level === 1) {
        doc.font(styles.header_1.font);
        doc.fontSize(styles.header_1.fontSize);
        buildRuns(textRuns, {
            font: styles.header_1.font,
            fontSize: styles.header_1.fontSize
        });
    } else if (level === 2) {
        doc.font(styles.header_2.font);
        doc.fontSize(styles.header_2.fontSize);
        buildRuns(textRuns, {
            font: styles.header_2.font,
            fontSize: styles.header_2.fontSize
        });
    }
};

// builds paragraphs with blockquote formatting
function buildBlockQuote(textRuns: Runs): void {
    doc.font(styles.block_quote.font);
    doc.fontSize(styles.block_quote.fontSize);
    buildRuns(textRuns, {
        font: styles.block_quote.font,
        fontSize: styles.block_quote.fontSize
    });
};

// builds paragraphs with code block formatting
function buildCodeBlock(textRuns: Runs): void {
    doc.font(styles.code_block.font);
    doc.fontSize(styles.code_block.fontSize);
    buildRuns(textRuns, {
        font: styles.code_block.font,
        fontSize: styles.code_block.fontSize
    });
};

// builds paragraphs with list formatting
function buildList(textRuns: Runs, lineAttributes: LineAttributes): void {
    if (lineAttributes.list === 'bullet') {
        resetLevelTrackers();
        buildBulletList(textRuns, lineAttributes);
    } else {
        buildOrderedList(textRuns, lineAttributes);
    }
};

// builds ordered lists; updates tracking
function buildOrderedList(textRuns: Runs, lineAttributes: LineAttributes): void {
    doc.font(styles.list_paragraph.font);
    doc.fontSize(styles.list_paragraph.fontSize);
    doc.fillColor('black');
    let baseIndent = styles.list_paragraph.baseIndent;
    let levelIndent = styles.list_paragraph.levelIndent;
    let level = (lineAttributes.indent ? lineAttributes.indent : 0);
    doc.text(getListIndicator(level) + '.', baseIndent + (levelIndent * (level + 1)), null, {
        width: (72*6.5)-(3+levelIndent*(level + 1)),
        continued: false
    });
    doc.moveUp();
    buildRuns(textRuns, {
        font: styles.list_paragraph.font,
        fontSize: styles.list_paragraph.fontSize,
        indent: 75 + (levelIndent * (level + 1))
    });
};

// builds unordered lists
function buildBulletList(textRuns: Runs, lineAttributes: LineAttributes): void {
    doc.font(styles.list_paragraph.font);
    doc.fontSize(styles.list_paragraph.fontSize);
    doc.fillColor('black');
    let baseIndent = styles.list_paragraph.baseIndent;
    let levelIndent = styles.list_paragraph.levelIndent;
    let level = (lineAttributes.indent ? lineAttributes.indent : 0 ) + 1;
    doc.text('\u2022', baseIndent + (levelIndent * level), null, {
        width: (72*6.5)-(3+levelIndent*level),
        continued: false
    });
    doc.moveUp();
    buildRuns(textRuns, {
        font: styles.list_paragraph.font,
        fontSize: styles.list_paragraph.fontSize,
        indent: 75 + (levelIndent * level)
    });
};

// BUILDING RUNS

// inserts text for each run
function buildRuns(textRuns: Runs, base: TextBase): void {
    let runTracker = 0;
    for (const run of textRuns) {
        doc.font(base.font);
        doc.fontSize(base.fontSize);
        setPreRunAttributes((run as TextRun).attributes, base);
        doc.text((run as TextRun).text ? (run as TextRun).text : (run as {formula: string}).formula, base.indent ? base.indent : 72, null, setRunAttributes((run as TextRun).attributes, runTracker === textRuns.length-1));
        runTracker++;
    };
};

// sets formatting attributes that must occur before the doc.text() call
function setPreRunAttributes(runAttributes: RunAttributes | undefined, base: TextBase): void {
    if (runAttributes?.size) {
        setRunSize(runAttributes.size, base.fontSize);
    }
    if (runAttributes?.bold) {
        setBoldFont(base.font);
    }
    runAttributes?.color ? doc.fillColor(runAttributes.color) : runAttributes?.link ? doc.fillColor('blue') : doc.fillColor('black');
};

// setting formatting attributes that must occur in the doc.text() options argument
function setRunAttributes(attributes: RunAttributes | undefined, lastRun: boolean): object {
    return {
        underline: attributes?.underline ? true : false,
        strike: attributes?.strike ? true : false,
        oblique: attributes?.italic ? true : false,
        link: attributes?.link ? attributes.link : null,
        continued: !lastRun
    };
};

// adjusts the run size based on the base size
function setRunSize(size: string, baseSize: number): void {
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
function setBoldFont(baseFont: string): void {
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
