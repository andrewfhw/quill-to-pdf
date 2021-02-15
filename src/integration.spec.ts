jest.mock('./pdfkit.standalone');

import { ParsedQuillDelta } from 'quilljs-parser';
import PDFDocument from './pdfkit.standalone';
import { DocMethods, DocRecord, MockPDFDocument } from './test-utilities';
import { default as exporter } from './pdf-exporter';

const mockPdfKit = PDFDocument as jest.MockedClass<typeof PDFDocument>;

let activeMock: any;

mockPdfKit.mockImplementation(() => {
    const doc = new MockPDFDocument();
    activeMock = doc;
    return doc as any;
});

describe('integration', () => {

   it('', () => {

    const fakeDelta: ParsedQuillDelta = {
        setup: {
            hyperlinks: [],
            numberedLists: 0
        },
        paragraphs: [{
            textRuns: [{
                text: 'hello'
            }]
        }]
    };
    const output: DocRecord[] = [{
        method: DocMethods.MOVEDOWN,
        arguments: [undefined]
    },{
        method: DocMethods.FONT,
        arguments: ['Times-Roman']
    },{
        method: DocMethods.FONTSIZE,
        arguments: [12]
    },{
        method: DocMethods.FONT,
        arguments: ['Times-Roman']
    },{
        method: DocMethods.FONTSIZE,
        arguments: [12]
    },{
        method: DocMethods.FILLCOLOR,
        arguments: ['black']
    },{
        method: DocMethods.TEXT,
        arguments: ['hello', 72, null, {
            underline: false,
            strike: false,
            oblique: false,
            link: null,
            continued: false
        }]
    }]
    exporter.generatePdf(fakeDelta);
    expect(activeMock.docRecord).toEqual(output)

   });

});