import { InsertEmbed, ParsedQuillDelta, RawQuillDelta, RunAttributes } from 'quilljs-parser';
import { Config, LineAttr, QParagraph, Runs, TextBase } from './interfaces';
import { default as PdfBuilder } from './pdf-builder';
jest.mock('./pdfkit.standalone.js');
jest.mock('quilljs-parser');
import { parseQuillDelta } from 'quilljs-parser';
import PDFDocument from './pdfkit.standalone';
import { FakeStream, MockPDFDocument } from './test-utilities';

// create a type safe version of the PDFDocument mock from pdfkit
const mockPdfKit = PDFDocument as jest.MockedClass<typeof PDFDocument>;
// mock the return value of the PDFDocument constructor
mockPdfKit.mockReturnValue(new MockPDFDocument() as any);
// create a type safe version of the parseQuillDelta function from quilljs parser
const mockParseDelta = parseQuillDelta as jest.MockedFunction<typeof parseQuillDelta>;

describe('PdfBuilder', () => {

    let builder: PdfBuilder;
    let mockDoc: MockPDFDocument;

    beforeEach(() => {
        builder = new PdfBuilder();
        mockDoc = new MockPDFDocument();
    });

    describe('getPdfStream', () => {

        let fakeDoc: any;
        let fakeDelta: { ops: [{ insert: '\n' }] };
        let fakeConfig: Config;

        beforeEach(() => {
            fakeDoc = undefined;
            fakeDelta = { ops: [{ insert: '\n' }]};
            fakeConfig = {};
        });

        it('should be defined', () => {
            expect(builder.buildPdf).toBeDefined();
        });

        it('should call the proper functions; no custom styles', () => {
            const resetSpy = jest.spyOn(builder, 'resetLevelTrackers');
            const prepareSpy = jest.spyOn(builder, 'prepareInput').mockImplementation((delta: any) => delta);
            const buildPdfSpy = jest.spyOn(builder, 'buildPdf').mockImplementation((delta: any) => delta);
            const resetStyleSpy = jest.spyOn(builder, 'resetStyles');
            const styleConfigSpy = jest.spyOn(builder, 'configureStyles');

            const stream = builder.getPdfStream(fakeDoc, fakeDelta, fakeConfig);

            expect(resetSpy).toHaveBeenCalled();
            expect(resetStyleSpy).toHaveBeenCalled();
            expect(styleConfigSpy).not.toHaveBeenCalled();
            expect(mockPdfKit).toHaveBeenCalled();
            expect(stream).toBeInstanceOf(FakeStream);
            expect(prepareSpy).toHaveBeenCalledWith(fakeDelta);
            const doc = new MockPDFDocument();
            doc.endCalled = true;
            expect(buildPdfSpy).toHaveBeenCalledWith(fakeDelta, doc);
        });

        it('should call the proper functions; with custom styles', () => {
            fakeConfig.styles = {
                normal: {
                    font: 'abc',
                    fontSize: 12,
                    baseIndent: 12,
                    levelIndent: 12
                }
            };
            const resetSpy = jest.spyOn(builder, 'resetLevelTrackers');
            const prepareSpy = jest.spyOn(builder, 'prepareInput').mockImplementation((delta: any) => delta);
            const buildPdfSpy = jest.spyOn(builder, 'buildPdf').mockImplementation((delta: any) => delta);
            const resetStyleSpy = jest.spyOn(builder, 'resetStyles');
            const styleConfigSpy = jest.spyOn(builder, 'configureStyles');

            const stream = builder.getPdfStream(fakeDoc, fakeDelta, fakeConfig);

            expect(resetSpy).toHaveBeenCalled();
            expect(resetStyleSpy).toHaveBeenCalled();
            expect(styleConfigSpy).toHaveBeenCalledWith(fakeConfig);
            expect(mockPdfKit).toHaveBeenCalled();
            expect(stream).toBeInstanceOf(FakeStream);
            expect(prepareSpy).toHaveBeenCalledWith(fakeDelta);
            const doc = new MockPDFDocument();
            doc.endCalled = true;
            expect(buildPdfSpy).toHaveBeenCalledWith(fakeDelta, doc);
        });

    });


    describe('buildPdf', () => {

        it('should iterate over each paragraph in each delta', () => {
            const fakeDeltas: ParsedQuillDelta[] = [{
                setup: {
                    hyperlinks: [],
                    numberedLists: 0
                },
                paragraphs: [{
                    textRuns: [{
                        text: 'first run, first paragraph, first delta'
                    }]
                },{
                    textRuns: [{
                        text: 'first run, second paragraph, first delta'
                    }]
                }]
            },{
                setup: {
                    hyperlinks: [],
                    numberedLists: 0
                },
                paragraphs: [{
                    textRuns: [{
                        text: 'first run, first paragraph, second delta'
                    }]
                }]
            }];
            const buildSpy = jest.spyOn(builder, 'buildParagraph').mockImplementation(() => true);
            builder.buildPdf(fakeDeltas, 'doc');
            expect(buildSpy).toHaveBeenCalledWith({
                textRuns: [{
                    text: 'first run, first paragraph, first delta'
                }]
            }, 'doc');
            expect(buildSpy).toHaveBeenCalledWith({
                textRuns: [{
                    text: 'first run, second paragraph, first delta'
                }]
            }, 'doc');
            expect(buildSpy).toHaveBeenCalledWith({
                textRuns: [{
                    text: 'first run, first paragraph, second delta'
                }]
            }, 'doc');
        });

    });


    describe('buildParagraph', () => {

        it('should move down for each paragraph', () => {
            jest.spyOn(builder, 'buildSimpleParagraphs').mockImplementationOnce(() => null);
            const downSpy = jest.spyOn(mockDoc, 'moveDown');
            const mockParagraph: QParagraph = {
                textRuns: [{
                    text: 'Any'
                }]
            };
            builder.buildParagraph(mockParagraph, mockDoc);
            expect(downSpy).toHaveBeenCalled();
        });

        it('should handle an embed', () => {
            const mockPara: QParagraph = {
                embed: {
                    video: 'video'
                }
            };
            const buildEmbedSpy = jest.spyOn(builder, 'buildEmbed').mockImplementationOnce(() => null);
            const resetSpy = jest.spyOn(builder, 'resetLevelTrackers');
            builder.buildParagraph(mockPara, mockDoc);
            expect(resetSpy).toHaveBeenCalled();
            expect(buildEmbedSpy).toHaveBeenCalledWith(mockPara.embed, mockDoc);
        });

        it('should handle a formatted paragraph', () => {
            const mockPara: QParagraph = {
                textRuns: [{
                    text: 'This is a Heading'
                }],
                attributes: {
                    header: 1
                }
            };
            const buildFormattedSpy = jest.spyOn(builder, 'buildFormattedParagraphs').mockImplementationOnce(() => null);
            const resetSpy = jest.spyOn(builder, 'resetLevelTrackers');
            builder.buildParagraph(mockPara, mockDoc);
            expect(resetSpy).not.toHaveBeenCalled();
            expect(buildFormattedSpy).toHaveBeenCalledWith(mockPara, mockDoc);
        });

        it('should handle an unformatted paragraph', () => {
            const mockPara: QParagraph = {
                textRuns: [{
                    text: 'Here is some basic text for the document.',
                    attributes: {
                        bold: true
                    }
                }]
            };
            const buildSimpleSpy = jest.spyOn(builder, 'buildSimpleParagraphs').mockImplementationOnce(() => null);
            const resetSpy = jest.spyOn(builder, 'resetLevelTrackers');
            builder.buildParagraph(mockPara, mockDoc);
            expect(resetSpy).toHaveBeenCalled();
            expect(buildSimpleSpy).toHaveBeenCalledWith(mockPara, mockDoc);
        });

    });

    describe('buildEmbed', () => {

        it('should add an image to the doc', () => {
            const embed: InsertEmbed = {
                image: 'base64string'
            };
            const imageSpy = jest.spyOn(mockDoc, 'image');
            const downSpy = jest.spyOn(mockDoc, 'moveDown');
            builder.buildEmbed(embed, mockDoc);
            expect(imageSpy).toHaveBeenCalledWith('base64string', { fit: [200, 200], align: 'center'});
            expect(downSpy).toHaveBeenCalled();
        });

        it('should add video text to the doc', () => {
            const embed: InsertEmbed = {
                video: 'linktovideo'
            };
            const fontSpy = jest.spyOn(mockDoc, 'font');
            const sizeSpy = jest.spyOn(mockDoc, 'fontSize');
            const textSpy = jest.spyOn(mockDoc, 'text');
            builder.buildEmbed(embed, mockDoc);
            expect(fontSpy).toHaveBeenCalledWith('Times-Roman');
            expect(sizeSpy).toHaveBeenCalledWith(12);
            expect(textSpy).toHaveBeenCalledWith('linktovideo', 72, null, { 
                link: 'linktovideo',
                underline: false,
                strike: false,
                oblique: false,
                continued: false
             });
        });

    });


    describe('buildSimpleParagraphs', () => {

        it('should set font, fontsize, and call build runs', () => {
            const buildRunSpy = jest.spyOn(builder, 'buildRuns').mockImplementation(() => null);
            const mockPara: QParagraph = {
                textRuns: [{
                    text: 'Here is the basic text'
                }]
            };
            builder.buildSimpleParagraphs(mockPara, mockDoc);
            expect(buildRunSpy).toHaveBeenCalledWith([{ text: 'Here is the basic text'}], {
                font: 'Times-Roman',
                fontSize: 12,
                indent: 72
            }, mockDoc);
        });

    });


    describe('buildFormattedParagraphs', () => {

        it('should throw if no line attributes', () => {
            const mockPara: QParagraph = {
                textRuns: [{ text: 'Here is some text.' }],
                attributes: undefined
            };
            expect(() => builder.buildFormattedParagraphs(mockPara, mockDoc)).toThrow('Something went wrong.');
        });

        it('should call build header for headers', () => {
            const mockPara: QParagraph = {
                textRuns: [{ text: 'My New Header' }],
                attributes: { header: 1 }
            };
            const resetSpy = jest.spyOn(builder, 'resetLevelTrackers');
            const buildHeaderSpy = jest.spyOn(builder, 'buildHeader').mockImplementationOnce(() => null);
            builder.buildFormattedParagraphs(mockPara, mockDoc);
            expect(resetSpy).toHaveBeenCalled();
            expect(buildHeaderSpy).toHaveBeenCalledWith(mockPara.textRuns, 1, mockDoc);
        });

        it('should call build block quote for block quotes', () => {
            const mockPara: QParagraph = {
                textRuns: [{ text: 'A Quote From Somebody.'}],
                attributes: { blockquote: true }
            };
            const resetSpy = jest.spyOn(builder, 'resetLevelTrackers');
            const buildQuoteSpy = jest.spyOn(builder, 'buildBlockQuote').mockImplementationOnce(() => null);
            builder.buildFormattedParagraphs(mockPara, mockDoc);
            expect(resetSpy).toHaveBeenCalled();
            expect(buildQuoteSpy).toHaveBeenCalledWith(mockPara.textRuns, mockDoc);
        });

        it('should call build code-block for code-blocks', () => {
            const mockPara: QParagraph = {
                textRuns: [{ text: 'const doc = new Block();' }],
                attributes: {
                    "code-block" : true
                }
            };
            const resetSpy = jest.spyOn(builder, 'resetLevelTrackers');
            const buildCodeSpy = jest.spyOn(builder, 'buildCodeBlock').mockImplementationOnce(() => null);
            builder.buildFormattedParagraphs(mockPara, mockDoc);
            expect(resetSpy).toHaveBeenCalled();
            expect(buildCodeSpy).toHaveBeenCalledWith(mockPara.textRuns, mockDoc);
        });

        it('should call build list for lists', () => {
            const mockPara: QParagraph = {
                textRuns: [{ text: 'An entry in a list of items.'}],
                attributes: {
                    list: 'bullet'
                }
            };
            const resetSpy = jest.spyOn(builder, 'resetLevelTrackers');
            const buildListSpy = jest.spyOn(builder, 'buildList').mockImplementationOnce(() => null);
            builder.buildFormattedParagraphs(mockPara, mockDoc);
            expect(resetSpy).not.toHaveBeenCalled();
            expect(buildListSpy).toHaveBeenCalledWith(mockPara.textRuns, mockPara.attributes, mockDoc);
        });

        it('should call build citation for citations', () => {
            const mockPara: QParagraph = {
                textRuns: [{ text: 'Krugman, P. (2009). The Crisis.' }],
                attributes: {
                    citation: true
                }
            };
            const resetSpy = jest.spyOn(builder, 'resetLevelTrackers');
            const buildCitationSpy = jest.spyOn(builder, 'buildCitation').mockImplementationOnce(() => null);
            builder.buildFormattedParagraphs(mockPara, mockDoc);
            expect(resetSpy).toHaveBeenCalled();
            expect(buildCitationSpy).toHaveBeenCalledWith(mockPara.textRuns, mockPara.attributes, mockDoc);
        });

    });


    describe('buildHeader', () => {

        let fontSpy: jest.MockedFunction<any>;
        let sizeSpy: jest.MockedFunction<any>;
        let buildRunSpy: jest.MockedFunction<any>;

        beforeEach(() => {
            fontSpy = jest.spyOn(mockDoc, 'font');
            sizeSpy = jest.spyOn(mockDoc, 'fontSize');
            buildRunSpy = jest.spyOn(builder, 'buildRuns').mockImplementation(() => null);
        })

        it('should build a level one heading', () => {
            const runs: Runs = [{ text: 'The Title of the Heading' }];
            builder.buildHeader(runs, 1, mockDoc);
            expect(buildRunSpy).toHaveBeenCalledWith(runs, {
                font: 'Helvetica-Bold',
                fontSize: 16,
                indent: 72
            }, mockDoc);
        });

        it('should build a level two heading', () => {
            const runs: Runs = [{ text: 'The Title of the Heading' }];
            builder.buildHeader(runs, 2, mockDoc);
            expect(buildRunSpy).toHaveBeenCalledWith(runs, {
                font: 'Helvetica-Bold',
                fontSize: 14,
                indent: 72
            }, mockDoc);
        });

    });


    describe('buildBlockQuote', () => {

        it('should build a block quote', () => {
            const buildRunsSpy = jest.spyOn(builder, 'buildRuns').mockImplementationOnce(() => null);
            const runs: Runs = [{ text: 'Text of the block quote' }];
            builder.buildBlockQuote(runs, mockDoc);
            expect(buildRunsSpy).toHaveBeenCalledWith(runs, {
                font: 'Times-Italic',
                fontSize: 12,
                indent: 72
            }, mockDoc);
        });

    });


    describe('buildCodeBlock', () => {

        it('should build a code block', () => {
            const buildRunsSpy = jest.spyOn(builder, 'buildRuns').mockImplementationOnce(() => null);
            const runs: Runs = [{ text: 'this is a code block' }];
            builder.buildCodeBlock(runs, mockDoc);
            expect(buildRunsSpy).toHaveBeenCalledWith(runs, {
                font: 'Courier',
                fontSize: 12,
                indent: 72
            }, mockDoc);
        });

    });


    describe('buildList', () => {

        let resetSpy: jest.MockedFunction<any>;

        beforeEach(() => {
            resetSpy = jest.spyOn(builder, 'resetLevelTrackers');
        })

        it('should route bullets to bullet list builder', () => {
            const runs: Runs = [{ text: 'A bullet list item.' }];
            const attr: LineAttr = { list: 'bullet' };
            const bulletSpy = jest.spyOn(builder, 'buildBulletList').mockImplementationOnce(() => null);
            builder.buildList(runs, attr, mockDoc);
            expect(resetSpy).toHaveBeenCalled();
            expect(bulletSpy).toHaveBeenCalledWith(runs, attr, mockDoc);
        });

        it('should route ordered to ordered list builder', () => {
            const runs: Runs = [{ text: 'An ordered list item.' }];
            const attr: LineAttr = { list: 'ordered' };
            const orderedSpy = jest.spyOn(builder, 'buildOrderedList').mockImplementation(() => null);
            builder.buildList(runs, attr, mockDoc);
            expect(resetSpy).not.toHaveBeenCalled();
            expect(orderedSpy).toHaveBeenCalledWith(runs, attr, mockDoc);
        });

    });


    describe('buildOrderedList', () => {

        let fontSpy: jest.MockedFunction<any>;
        let sizeSpy: jest.MockedFunction<any>;
        let fillSpy: jest.MockedFunction<any>;
        let textSpy: jest.MockedFunction<any>;
        let upSpy: jest.MockedFunction<any>;
        let indicatorSpy: jest.MockedFunction<any>;
        let runSpy: jest.MockedFunction<any>;

        beforeEach(() => {
            fontSpy = jest.spyOn(mockDoc, 'font');
            sizeSpy = jest.spyOn(mockDoc, 'fontSize');
            fillSpy = jest.spyOn(mockDoc, 'fillColor');
            textSpy = jest.spyOn(mockDoc, 'text');
            upSpy = jest.spyOn(mockDoc, 'moveUp');
            indicatorSpy = jest.spyOn(builder, 'getListIndicator').mockImplementation(() => '.');
            runSpy = jest.spyOn(builder, 'buildRuns').mockImplementation(() => null);
        });

        it('should build a level one ordered list item', () => {
            const runs: Runs = [{ text: 'Here is the content.' }];
            const attr: LineAttr = { list: 'ordered', indent: 0 };
            builder.buildOrderedList(runs, attr, mockDoc);
            expect(fontSpy).toHaveBeenCalledWith('Times-Roman');
            expect(sizeSpy).toHaveBeenCalledWith(12);
            expect(fillSpy).toHaveBeenCalledWith('black');
            expect(indicatorSpy).toHaveBeenCalledWith(0);
            expect(textSpy).toHaveBeenCalledWith('..', 75, null, {
                width: (72*6.5)-(3+75),
                continued: false
            });
            expect(upSpy).toHaveBeenCalled();
            expect(runSpy).toHaveBeenCalledWith(runs, {
                font: 'Times-Roman',
                fontSize: 12,
                indent: 50 + 25 + 3 + 25
            }, mockDoc);
        });

        it('should build a level two orderd list item', () => {
            const runs: Runs = [{ text: 'Here is the content.' }];
            const attr: LineAttr = { list: 'ordered', indent: 1 };
            builder.buildOrderedList(runs, attr, mockDoc);
            expect(fontSpy).toHaveBeenCalledWith('Times-Roman');
            expect(sizeSpy).toHaveBeenCalledWith(12);
            expect(fillSpy).toHaveBeenCalledWith('black');
            expect(indicatorSpy).toHaveBeenCalledWith(1);
            expect(textSpy).toHaveBeenCalledWith('..', 100, null, {
                width: (72*6.5) - (3 + 100),
                continued: false
            });
            expect(upSpy).toHaveBeenCalled();
            expect(runSpy).toHaveBeenCalledWith(runs, {
                font: 'Times-Roman',
                fontSize: 12,
                indent: 50 + 50 + 3 + 25
            }, mockDoc);
        });

    });


    describe('buildBulletList', () => {

        let fontSpy: jest.MockedFunction<any>;
        let sizeSpy: jest.MockedFunction<any>;
        let fillSpy: jest.MockedFunction<any>;
        let textSpy: jest.MockedFunction<any>;
        let upSpy: jest.MockedFunction<any>;
        let indicatorSpy: jest.MockedFunction<any>;
        let runSpy: jest.MockedFunction<any>;

        beforeEach(() => {
            fontSpy = jest.spyOn(mockDoc, 'font');
            sizeSpy = jest.spyOn(mockDoc, 'fontSize');
            fillSpy = jest.spyOn(mockDoc, 'fillColor');
            textSpy = jest.spyOn(mockDoc, 'text');
            upSpy = jest.spyOn(mockDoc, 'moveUp');
            indicatorSpy = jest.spyOn(builder, 'getListIndicator').mockImplementation(() => '.');
            runSpy = jest.spyOn(builder, 'buildRuns').mockImplementation(() => null);
        });

        it('should build a level one bullet', () => {
            const runs: Runs = [{ text: 'Here is the content.' }];
            const attr: LineAttr = { list: 'bullet', indent: 0 };
            builder.buildBulletList(runs, attr, mockDoc);
            expect(fontSpy).toHaveBeenCalledWith('Times-Roman');
            expect(sizeSpy).toHaveBeenCalledWith(12);
            expect(fillSpy).toHaveBeenCalledWith('black');
            expect(textSpy).toHaveBeenCalledWith('\u2022', 75, null, {
                width: (72*6.5) - (3 + 75),
                continued: false
            });
            expect(upSpy).toHaveBeenCalled();
            expect(runSpy).toHaveBeenCalledWith(runs, {
                font: 'Times-Roman',
                fontSize: 12,
                indent: 75 + 3 + 25
            }, mockDoc);
            expect(indicatorSpy).not.toHaveBeenCalled();
        });

        it('should build a level two bullet', () => {
            const runs: Runs = [{ text: 'Here is the content.' }];
            const attr: LineAttr = { list: 'bullet', indent: 1 };
            builder.buildBulletList(runs, attr, mockDoc);
            expect(fontSpy).toHaveBeenCalledWith('Times-Roman');
            expect(sizeSpy).toHaveBeenCalledWith(12);
            expect(fillSpy).toHaveBeenCalledWith('black');
            expect(textSpy).toHaveBeenCalledWith('\u2022', 75 + 25, null, {
                width: (72*6.5) - (3 + 75 + 25),
                continued: false
            });
            expect(upSpy).toHaveBeenCalled();
            expect(runSpy).toHaveBeenCalledWith(runs, {
                font: 'Times-Roman',
                fontSize: 12,
                indent: 75 + 3 + 25 + 25
            }, mockDoc);
            expect(indicatorSpy).not.toHaveBeenCalled();
        });

    });


    describe('buildCitation', () => {

        it('should build a citation', () => {
            const runSpy = jest.spyOn(builder, 'buildRuns').mockImplementationOnce(() => null);
            const runs: Runs = [{ text: 'Here is a citation.' }];
            const attr: LineAttr = { citation: true };
            builder.buildCitation(runs, attr, mockDoc);
            expect(runSpy).toHaveBeenCalledWith(runs, {
                font: 'Times-Roman',
                fontSize: 12,
                indent: 72
            }, mockDoc);
        });

    });


    describe('buildRuns', () => {

        let fontSpy: jest.MockedFunction<any>;
        let sizeSpy: jest.MockedFunction<any>;
        let preSpy: jest.MockedFunction<any>;
        let textSpy: jest.MockedFunction<any>;
        let runAttrSpy: jest.MockedFunction<any>;

        beforeEach(() => {
            fontSpy = jest.spyOn(mockDoc, 'font');
            sizeSpy = jest.spyOn(mockDoc, 'fontSize');
            preSpy = jest.spyOn(builder, 'setPreRunAttributes').mockImplementation(() => null);
            textSpy = jest.spyOn(mockDoc, 'text');
            runAttrSpy = jest.spyOn(builder, 'setRunAttributes').mockImplementation(() => 'runattr' as any);
        });

        it('inserts the runs into the document', () => {
            const runs: Runs = [{
                text: 'Here is a run of text'
            },{
                text: 'And a second run of text'
            }];
            const base: TextBase = {
                font: 'Times-Roman',
                fontSize: 12,
            };
            builder.buildRuns(runs, base, mockDoc);
            expect(fontSpy).toHaveBeenCalledTimes(2);
            expect(sizeSpy).toHaveBeenCalledTimes(2);
            expect(preSpy).toHaveBeenCalledTimes(2);
            expect(textSpy).toHaveBeenCalledTimes(2);
            expect(runAttrSpy).toHaveBeenCalledTimes(2);
            expect(fontSpy).toHaveBeenCalledWith('Times-Roman');
            expect(sizeSpy).toHaveBeenCalledWith(12);
            expect(preSpy).toHaveBeenCalledWith(undefined, base, mockDoc);
            expect(textSpy).toHaveBeenCalledWith((runs[0] as any).text, 72, null, 'runattr');
            expect(textSpy).toHaveBeenCalledWith((runs[1] as any).text, 72, null, 'runattr');
        });

        it('inserts runs with special base indent', () => {
            const runs: Runs = [{
                text: 'Here is a run of text'
            },{
                text: 'And a second run of text'
            }];
            const base: TextBase = {
                font: 'Times-Italic',
                fontSize: 14,
                indent: 100
            };
            builder.buildRuns(runs, base, mockDoc);
            expect(fontSpy).toHaveBeenCalledTimes(2);
            expect(sizeSpy).toHaveBeenCalledTimes(2);
            expect(preSpy).toHaveBeenCalledTimes(2);
            expect(textSpy).toHaveBeenCalledTimes(2);
            expect(runAttrSpy).toHaveBeenCalledTimes(2);
            expect(fontSpy).toHaveBeenCalledWith('Times-Italic');
            expect(sizeSpy).toHaveBeenCalledWith(14);
            expect(preSpy).toHaveBeenCalledWith(undefined, base, mockDoc);
            expect(textSpy).toHaveBeenCalledWith((runs[0] as any).text, 100, null, 'runattr');
            expect(textSpy).toHaveBeenCalledWith((runs[1] as any).text, 100, null, 'runattr');
        });

        it('inserts a formula run into a document', () => {
            const runs: Runs = [{
                formula: 'x + y = z'
            },{
                text: 'Some regular text written here.'
            }];
            const base: TextBase = {
                font: 'Times-Roman',
                fontSize: 12
            };
            builder.buildRuns(runs, base, mockDoc);
            expect(fontSpy).toHaveBeenCalledTimes(2);
            expect(sizeSpy).toHaveBeenCalledTimes(2);
            expect(preSpy).toHaveBeenCalledTimes(2);
            expect(textSpy).toHaveBeenCalledTimes(2);
            expect(runAttrSpy).toHaveBeenCalledTimes(2);
            expect(fontSpy).toHaveBeenCalledWith('Times-Roman');
            expect(sizeSpy).toHaveBeenCalledWith(12);
            expect(preSpy).toHaveBeenCalledWith(undefined, base, mockDoc);
            expect(textSpy).toHaveBeenCalledWith((runs[0] as any).formula, 72, null, 'runattr');
            expect(textSpy).toHaveBeenCalledWith((runs[1] as any).text, 72, null, 'runattr');
        });

    });


    describe('setPreRunAttributes', () => {

        let sizeSpy: jest.MockedFunction<any>;
        let boldSpy: jest.MockedFunction<any>;
        let fillSpy: jest.MockedFunction<any>;

        beforeEach(() => {
            sizeSpy = jest.spyOn(builder, 'setRunSize');
            boldSpy = jest.spyOn(builder, 'setBoldFont');
            fillSpy = jest.spyOn(mockDoc, 'fillColor');
        });

        it('should set defaults if no run attributes', () => {
            const base: TextBase = {
                font: 'Times-Roman',
                fontSize: 12
            };
            builder.setPreRunAttributes(undefined, base, mockDoc);
            expect(sizeSpy).not.toHaveBeenCalled();
            expect(boldSpy).not.toHaveBeenCalled();
            expect(fillSpy).toHaveBeenCalledWith('black');
        });

        it('should set custom run size', () => {
            const attr: RunAttributes = {
                size: 'small'
            };
            const base: TextBase = {
                font: 'Times-Roman',
                fontSize: 12
            };
            builder.setPreRunAttributes(attr, base, mockDoc);
            expect(sizeSpy).toHaveBeenCalledWith('small', 12, mockDoc);
            expect(boldSpy).not.toHaveBeenCalled();
            expect(fillSpy).toHaveBeenCalledWith('black');
        });

        it('should set bold font for run', () => {
            const attr: RunAttributes = {
                bold: true
            };
            const base: TextBase = {
                font: 'Times-Roman',
                fontSize: 12
            };
            builder.setPreRunAttributes(attr, base, mockDoc);
            expect(sizeSpy).not.toHaveBeenCalled();
            expect(boldSpy).toHaveBeenCalledWith('Times-Roman', mockDoc);
            expect(fillSpy).toHaveBeenCalledWith('black');
        });

        it('should set custom color', () => {
            const attr: RunAttributes = {
                color: 'green'
            };
            const base: TextBase = {
                font: 'Times-Roman',
                fontSize: 12
            };
            builder.setPreRunAttributes(attr, base, mockDoc);
            expect(sizeSpy).not.toHaveBeenCalled();
            expect(boldSpy).not.toHaveBeenCalled();
            expect(fillSpy).toHaveBeenCalledWith('green');
        });

        it('should set blue color for links', () => {
            const attr: RunAttributes = {
                link: 'https://google.com'
            };
            const base: TextBase = {
                font: 'Times-Roman',
                fontSize: 12
            };
            builder.setPreRunAttributes(attr, base, mockDoc);
            expect(sizeSpy).not.toHaveBeenCalled();
            expect(boldSpy).not.toHaveBeenCalled();
            expect(fillSpy).toHaveBeenCalledWith('blue');
        });

        it('should successfully combine attribute calls', () => {
            const attr: RunAttributes = {
                size: 'large',
                link: 'google.com',
                bold: true
            };
            const base: TextBase = {
                font: 'Times-Roman',
                fontSize: 12
            };
            builder.setPreRunAttributes(attr, base, mockDoc);
            expect(sizeSpy).toHaveBeenCalledWith('large', 12, mockDoc);
            expect(boldSpy).toHaveBeenCalledWith('Times-Roman', mockDoc);
            expect(fillSpy).toHaveBeenCalledWith('blue');
        });

    });


    describe('setRunAttributes', () => {

        it('should set defaults if undefined attribute passed in', () => {
            expect(builder.setRunAttributes(undefined, true)).toEqual({
                underline: false,
                strike: false,
                oblique: false,
                link: null,
                continued: false
            });
        });

        it('should set an underline', () => {
            const attr: RunAttributes = {
                underline: true
            };
            expect(builder.setRunAttributes(attr, true)).toEqual({
                underline: true,
                strike: false,
                oblique: false,
                link: null,
                continued: false
            });
        });

        it('should set a strike', () => {
            const attr: RunAttributes = {
                strike: true
            };
            expect(builder.setRunAttributes(attr, false)).toEqual({
                underline: false,
                strike: true,
                oblique: false,
                link: null,
                continued: true
            });
        });

        it('should set oblique text', () => {
            const attr: RunAttributes = {
                italic: true
            };
            expect(builder.setRunAttributes(attr, false)).toEqual({
                underline: false,
                strike: false,
                oblique: true,
                link: null,
                continued: true
            });
        });

        it('should set a link', () => {
            const attr: RunAttributes = {
                link: 'google.com'
            };
            expect(builder.setRunAttributes(attr, true)).toEqual({
                underline: false,
                strike: false,
                oblique: false,
                link: 'google.com',
                continued: false
            });
        });

        it('should set underline and link', () => {
            const attr: RunAttributes = {
                underline: true,
                link: 'google.com'
            };
            expect(builder.setRunAttributes(attr, false)).toEqual({
                underline: true,
                strike: false,
                oblique: false,
                link: 'google.com',
                continued: true
            });
        });

    });


    describe('setRunSize', () => {

        let sizeSpy: jest.MockedFunction<any>;

        beforeEach(() => {
            sizeSpy = jest.spyOn(mockDoc, 'fontSize');
        });

        it('should set a small font size', () => {
            builder.setRunSize('small', 14, mockDoc);
            expect(sizeSpy).toHaveBeenCalledTimes(1);
            expect(sizeSpy).toHaveBeenCalledWith(10);
        });

        it('should set a large font size', () => {
            builder.setRunSize('large', 16, mockDoc);
            expect(sizeSpy).toHaveBeenCalledTimes(1);
            expect(sizeSpy).toHaveBeenCalledWith(20);
        });

        it('should set a huge font size', () => {
            builder.setRunSize('huge', 16, mockDoc);
            expect(sizeSpy).toHaveBeenCalledTimes(1);
            expect(sizeSpy).toHaveBeenCalledWith(22);
        });

    });


    describe('setBoldFont', () => {

        let fontSpy: jest.MockedFunction<any>;

        beforeEach(() => {
            fontSpy = jest.spyOn(mockDoc, 'font');
        });

        it('should set Times-Roman to bold', () => {
            builder.setBoldFont('Times-Roman', mockDoc);
            expect(fontSpy).toHaveBeenCalledTimes(1);
            expect(fontSpy).toHaveBeenCalledWith('Times-Bold');
        });

        it('should set Courier to bold', () => {
            builder.setBoldFont('Courier', mockDoc);
            expect(fontSpy).toHaveBeenCalledTimes(1);
            expect(fontSpy).toHaveBeenCalledWith('Courier-Bold');
        });

        it('should set Helvetica to bold', () => {
            builder.setBoldFont('Helvetica', mockDoc);
            expect(fontSpy).toHaveBeenCalledTimes(1);
            expect(fontSpy).toHaveBeenCalledWith('Helvetica-Bold');
        });

    });


    describe('prepareInput', () => {

        it('should throw if array does not contain elements of proper type', () => {
            const input = [{
                info: 'hello'
            }];
            expect(() => builder.prepareInput(input as any)).toThrow('Array must contain raw or parsed deltas only.');
        });

        it('should throw if single is not of proper type', () => {
            const input = {
                info: 'hello'
            };
            expect(() => builder.prepareInput(input as any)).toThrow('Must provide a raw or parsed delta.');
        });

        it('should handle a single raw delta', () => {
            mockParseDelta.mockImplementation(() => 'parseddelta' as any);
            const input: RawQuillDelta = {
                ops: [{
                    insert: 'Hello there.'
                }]
            };
            expect(builder.prepareInput(input)).toEqual(['parseddelta']);
            expect(mockParseDelta).toHaveBeenCalledWith(input);
        });

        it('should handle an array of raw deltas', () => {
            mockParseDelta.mockImplementation(() => 'parseddeltas' as any);
            const input: RawQuillDelta[] = [{
                ops: [{
                    insert: 'The First Delta'
                }]
            },{
                ops: [{
                    insert: 'The Second Delta'
                }]
            }];
            expect(builder.prepareInput(input)).toEqual(['parseddeltas', 'parseddeltas']);
            expect(mockParseDelta).toHaveBeenCalledWith(input[0]);
            expect(mockParseDelta).toHaveBeenCalledWith(input[1]);
            expect(mockParseDelta).toHaveBeenCalledTimes(2);
        });

        it('should handle a single parsed delta', () => {
            mockParseDelta.mockImplementation(() => 'parseddelta' as any);
            const input: ParsedQuillDelta = {
                setup: {
                    hyperlinks: [],
                    numberedLists: 0
                },
                paragraphs: [{
                    textRuns: [{
                        text: 'Here is the text.'
                    }]
                }]
            };
            expect(builder.prepareInput(input)).toEqual([input]);
            expect(mockParseDelta).toHaveBeenCalledTimes(0);
        });

        it('should handle an array of parsed deltas', () => {
            mockParseDelta.mockImplementation(() => 'parseddelta' as any);
            const input: RawQuillDelta = {
                ops: [{
                    insert: 'The text here.'
                }]
            };
            expect(builder.prepareInput(input)).toEqual(['parseddelta']);
            expect(mockParseDelta).toHaveBeenCalledTimes(1);
            expect(mockParseDelta).toHaveBeenCalledWith(input);
        });

    });


    describe('configureStyles', () => {

        it('should override normal default style', () => {
            const config: Config = {
                styles: {
                    normal: {
                        font: 'Arial',
                        fontSize: 22,
                        baseIndent: 225,
                        levelIndent: 23,
                        italics: false,
                        indent: {
                            left: 120,
                            right: 150
                        }
                    }
                }
            };
            builder.configureStyles(config);
            expect(builder.style.normal).toEqual({
                font: 'Arial',
                fontSize: 22,
                baseIndent: 225,
                levelIndent: 23,
                italics: false,
                indent: {
                    left: 120,
                    right: 150
                }
            });
            expect(builder.style.header_1).toEqual({
                font: 'Helvetica-Bold',
                fontSize: 16,
                baseIndent: 72,
                levelIndent: 0
            });
        });

        it('should override the default header_1 style', () => {
            const config: Config = {
                styles: {
                    header_1: {
                        font: 'Avenir',
                        fontSize: 32,
                        baseIndent: 100,
                        levelIndent: 20
                    }
                }
            };
            builder.configureStyles(config);
            expect(builder.style.header_1).toEqual({
                font: 'Avenir',
                fontSize: 32,
                baseIndent: 100,
                levelIndent: 20
            });
            expect(builder.style.normal).toEqual({
                font: 'Times-Roman',
                fontSize: 12,
                baseIndent: 72,
                levelIndent: 0,
            });
        });

        it('should override the default header_2 style', () => {
            const config: Config = {
                styles: {
                    header_2: {
                        font: 'Times-Roman',
                        fontSize: 14,
                        baseIndent: 80,
                        levelIndent: 22
                    }
                }
            };
            builder.configureStyles(config);
            expect(builder.style.header_2).toEqual({
                font: 'Times-Roman',
                fontSize: 14,
                baseIndent: 80,
                levelIndent: 22
            });
            expect(builder.style.normal).toEqual({
                font: 'Times-Roman',
                fontSize: 12,
                baseIndent: 72,
                levelIndent: 0,
            });
        });

        it('should override the default block_quote and code_block styles', () => {
            const config: Config = {
                styles: {
                    block_quote: {
                        font: 'Courier',
                        fontSize: 13,
                        baseIndent: 22,
                        levelIndent: 21,
                        italics: false,
                        indent: {
                            left: 11,
                            right: 0
                        }
                    },
                    code_block: {
                        font: 'Comic Sans',
                        fontSize: 30,
                        baseIndent: 12,
                        levelIndent: 29
                    }
                }
            };
            builder.configureStyles(config);
            expect(builder.style.block_quote).toEqual({
                font: 'Courier',
                fontSize: 13,
                baseIndent: 22,
                levelIndent: 21,
                italics: false,
                indent: {
                    left: 11,
                    right: 0
                }
            });
            expect(builder.style.code_block).toEqual({
                font: 'Comic Sans',
                fontSize: 30,
                baseIndent: 12,
                levelIndent: 29
            });
        });

        it('should override the default list_paragraph style', () => {
            const config: Config = {
                styles: {
                    list_paragraph: {
                        font: 'Arial',
                        fontSize: 7,
                        baseIndent: 121,
                        levelIndent: 31
                    }
                }
            };
            builder.configureStyles(config);
            expect(builder.style.list_paragraph).toEqual({
                font: 'Arial',
                fontSize: 7,
                baseIndent: 121,
                levelIndent: 31
            });
        });

        it('should override the default citation style', () => {
            const config: Config = {
                styles: {
                    citation: {
                        font: 'Monospace',
                        fontSize: 15,
                        levelIndent: 12,
                        baseIndent: 33
                    }
                }
            };
            builder.configureStyles(config);
            expect(builder.style.citation).toEqual({
                font: 'Monospace',
                fontSize: 15,
                levelIndent: 12,
                baseIndent: 33
            });
        });

        it('should only partially override normal style', () => {
            const config: Config = {
                styles: {
                    normal: {
                        font: 'Arial'
                    }
                }
            };
            builder.configureStyles(config);
            expect(builder.style.normal).toEqual({
                font: 'Arial',
                fontSize: 12,
                baseIndent: 72,
                levelIndent: 0
            });
        });

        it('should add a style that did not exist previously', () => {
            const config: Config = {
                styles: {
                    footer: {
                        font: 'Avenir',
                        fontSize: 8,
                        baseIndent: 72,
                        levelIndent: 0
                    }
                }
            };
            builder.configureStyles(config);
            expect(builder.style).toHaveProperty('footer');
            expect(builder.style.footer).toEqual({
                font: 'Avenir',
                fontSize: 8,
                baseIndent: 72,
                levelIndent: 0
            });
            expect(builder.style.normal).toEqual({
                font: 'Times-Roman',
                fontSize: 12,
                baseIndent: 72,
                levelIndent: 0,
            });
        });

    });


    describe('resetStyles', () => {

        it('should reset styles back to default values', () => {
            builder.style.normal = {
                font: 'Arial',
                fontSize: 30,
                levelIndent: 10,
                baseIndent: 1,
                italics: true,
                indent: {
                    left: 99,
                    right: 11
                }
            };
            expect(builder.style.normal).toEqual({
                font: 'Arial',
                fontSize: 30,
                levelIndent: 10,
                baseIndent: 1,
                italics: true,
                indent: {
                    left: 99,
                    right: 11
                }
            });
            builder.resetStyles();
            expect(builder.style.normal).toEqual({
                font: 'Times-Roman',
                fontSize: 12,
                baseIndent: 72,
                levelIndent: 0,
            });
        });

    });


    describe('resetLevelTrackers', () => {

        it('should set level trackers back to 0', () => {
            builder.levelTrackers = [3, 1, 0, 4, 6, 2];
            expect(builder.levelTrackers).toEqual([3, 1, 0, 4, 6, 2]);
            builder.resetLevelTrackers();
            expect(builder.levelTrackers).toEqual([0, 0, 0, 0, 0, 0]);
        });

    });


    describe('updateLevelTrackers', () => {

        it('should leave lower levels at current, increment active, zero higher', () => {
            builder.levelTrackers = [3, 2, 2, 5, 2, 1];
            builder.updateLevelTrackers(2);
            expect(builder.levelTrackers).toEqual([3, 2, 3, 0, 0, 0]);
        });

    });


    describe('getListIndicator', () => {

        it('should get this list indicator and update trackers', () => {
            const trackerSpy = jest.spyOn(builder, 'updateLevelTrackers').mockImplementationOnce(() => null);
            builder.levelTrackers = [2, 1, 0, 0, 0, 0];
            expect(builder.getListIndicator(1)).toBe('b');
            expect(trackerSpy).toHaveBeenCalledWith(1);
        });

        it('should get a level three indicator', () => {
            jest.spyOn(builder, 'updateLevelTrackers');
            builder.levelTrackers = [3, 7, 3, 4, 1, 0];
            expect(builder.getListIndicator(2)).toBe('iv');
        });

        it('should get a level four indicator', () => {
            jest.spyOn(builder, 'updateLevelTrackers').mockImplementationOnce(() => null);
            builder.levelTrackers = [5, 1, 8, 3, 6, 5];
            expect(builder.getListIndicator(3)).toBe('4');
        });

        it('should get a level 5 indicator', () => {
            jest.spyOn(builder, 'updateLevelTrackers').mockImplementationOnce(() => null);
            builder.levelTrackers = [1, 2, 3, 4, 5, 6];
            expect(builder.getListIndicator(4)).toBe('f');
        });

        it('should get a level 6 indicator', () => {
            jest.spyOn(builder, 'updateLevelTrackers').mockImplementationOnce(() => null);
            builder.levelTrackers = [3, 9, 2, 6, 1, 8];
            expect(builder.getListIndicator(5)).toBe('ix');
        });

    });

});