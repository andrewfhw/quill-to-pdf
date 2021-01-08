import PDFDocument from './pdfkit.standalone';
import BlobStream from './blob-stream';
import { RawQuillDelta, ParsedQuillDelta, parseQuillDelta, Paragraph, TextRun, InsertEmbed, RunAttributes, LineAttributes } from 'quilljs-parser';
import { Config, RawOrParsedDelta, TextBase } from './interfaces';
import { saveAs } from 'file-saver';
import { removeAllListeners } from 'process';

let doc: any;
let styles = {
    normal: {
        font: 'Times-Roman',
        fontSize: 12
    },
    header_1: {
        font: 'Helvetica-Bold',
        fontSize: 16,
    },
    header_2: {
        font: 'Helvetica-Bold',
        fontSize: 14,
    },
    block_quote: {
        font: 'Times-Roman',
        fontSize: 12,
        italics: true,
        indent: {
            left: 0,
            right: 0
        }
    },
    code_block: {
        font: 'Courier',
        fontSize: 12,
        indent: {
            left: 0,
            right: 0
        }
    },
    list_paragraph: {
        font: 'Times-Roman',
        fontSize: 12,
        baseIndent: 50,
        levelIndent: 25
    }
};

const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59', '60', '61', '62', '63', '64', '65', '66', '67', '68', '69', '70', '71', '72', '73', '74', '75', '76', '77', '78', '79', '80', '81', '82', '83', '84', '85', '86', '87', '88', '89', '90', '91', '92', '93', '94', '95', '96', '97', '98', '99', '100'];

const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'aa', 'bb', 'cc', 'dd', 'ee', 'ff', 'gg', 'hh', 'ii', 'jj', 'kk', 'll', 'mm', 'nn', 'oo', 'pp', 'qq', 'rr', 'ss', 'tt', 'uu', 'vv', 'ww', 'xx', 'yy', 'zz'];

const roman = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi', 'xii', 'xiii', 'xiv', 'xv', 'xvi', 'xvii', 'xviii', 'xix', 'xx', 'xxi', 'xxii', 'xxiii', 'xxiv', 'xxv', 'xxvi', 'xxvii', 'xxviii', 'xxix', 'xxx', 'xxxi', 'xxxii', 'xxxiii', 'xxxiv', 'xxxv', 'xxxvi', 'xxxvii', 'xxxviii', 'xxxix', 'xl', 'xli', 'xlii', 'xliii', 'xliv', 'xlv', 'xlvi', 'xlvii', 'xlviii', 'xlix', 'l'];

const listIndicators = [numbers, letters, roman, numbers, letters, roman];

const levelTrackers: number[] = [0, 0, 0, 0, 0, 0];

// resets ordered list back to original
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

export function generatePdf(delta: RawOrParsedDelta): void {
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

// main function for building the PDF document
function buildPdf(parsedDeltas: ParsedQuillDelta[]): void {
    for (const delta of parsedDeltas) {
        for (const paragraph of delta.paragraphs) {
            buildParagraph(paragraph);
        }
    };
};

function buildParagraph(paragraph: Paragraph): void {
    doc.moveDown();
    // if paragraph has own formatting
    if (paragraph.attributes) {
        buildFormattedParagraphs(paragraph);
    // no paragraph formatting
    } else {
        resetLevelTrackers();
        buildSimpleParagraphs(paragraph);
    }
};

// handles all formatted paragraphs
function buildFormattedParagraphs(paragraph: Paragraph): void {
    const lineAttributes = paragraph.attributes;
    if (!lineAttributes) {
        throw new Error('Something went wrong.');
    }
    if (lineAttributes.header) {
        resetLevelTrackers();
        buildHeader(paragraph.textRuns as TextRun[], lineAttributes.header);
    }
    if (lineAttributes.blockquote) {
        resetLevelTrackers();
        buildBlockQuote(paragraph.textRuns as TextRun[]);
    }
    if (lineAttributes['code-block']) {
        resetLevelTrackers();
        buildCodeBlock(paragraph.textRuns as TextRun[]);
    }
    if (lineAttributes.list) {
        buildList(paragraph.textRuns as TextRun[], paragraph.attributes as LineAttributes);
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


// HANDLING FORMATTED PARAGRAPHS

function buildHeader(textRuns: TextRun[], level: number): void {
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

function buildBlockQuote(textRuns: TextRun[]): void {
    doc.font(styles.block_quote.font);
    doc.fontSize(styles.block_quote.fontSize);
    buildRuns(textRuns, {
        font: styles.block_quote.font,
        fontSize: styles.block_quote.fontSize
    });
};

function buildCodeBlock(textRuns: TextRun[]): void {
    doc.font(styles.code_block.font);
    doc.fontSize(styles.code_block.fontSize);
    buildRuns(textRuns, {
        font: styles.code_block.font,
        fontSize: styles.code_block.fontSize
    });
};

function buildList(textRuns: TextRun[], lineAttributes: LineAttributes): void {
    if (lineAttributes.list === 'bullet') {
        resetLevelTrackers();
        buildBulletList(textRuns, lineAttributes);
    } else {
        buildOrderedList(textRuns, lineAttributes);
    }
};

function buildOrderedList(textRuns: TextRun[], lineAttributes: LineAttributes): void {
    doc.font(styles.list_paragraph.font);
    doc.fontSize(styles.list_paragraph.fontSize);
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

function buildBulletList(textRuns: TextRun[], lineAttributes: LineAttributes): void {
    doc.font(styles.list_paragraph.font);
    doc.fontSize(styles.list_paragraph.fontSize);
    // get the indent level
    // insert the bullet
    // insert the text runs with hanging indent
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


function buildRuns(textRuns: TextRun[], base: TextBase): void {
    let runTracker = 0;
    for (const run of textRuns) {
        doc.font(base.font);
        doc.fontSize(base.fontSize);
        setPreRunAttributes(run.attributes, base);
        doc.text(run.text, base.indent ? base.indent : 72, null, setRunAttributes(run.attributes, runTracker === textRuns.length-1));
        runTracker++;
    };
};

function setPreRunAttributes(runAttributes: RunAttributes | undefined, base: TextBase): void {
    if (runAttributes?.size) {
        setRunSize(runAttributes.size, base.fontSize);
    }
    if (runAttributes?.bold) {
        setBoldFont(base.font);
    }
};

function setRunAttributes(attributes: RunAttributes | undefined, lastRun: boolean): object {
    return {
        underline: attributes?.underline ? true : false,
        strike: attributes?.strike ? true : false,
        oblique: attributes?.italic ? true : false,
        continued: !lastRun
    }
};

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
    }
};

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
    }
};
