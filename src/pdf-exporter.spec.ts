jest.mock('./pdf-builder');
jest.mock('./pdfkit.standalone');

import { default as PdfBuilder } from './pdf-builder';
import { Config, RawOrParsedDelta } from './interfaces';
import { default as exporter, PdfExporter } from './pdf-exporter';
import { FakeStream } from './test-utilities';

// create a type safe version of the PdfBuilder mock
const mockPdfBuilder = PdfBuilder as jest.MockedClass<typeof PdfBuilder>;

describe('exported object', () => {

    it('should be defined', () => {
        expect(exporter).toBeDefined();
    });

    it('should be an instance of class PdfExporter', () => {
        expect(exporter).toBeInstanceOf(PdfExporter);
    });

});

describe('generatePdf', () => {

    let fakeDelta: RawOrParsedDelta;
    let fakeConfig: Config;
    let fakeStream: FakeStream;

    beforeEach(() => {
        fakeDelta = { ops: [{ insert: '\n' }] };
        fakeConfig = { };
        fakeStream = new FakeStream();
        mockPdfBuilder.prototype.getPdfStream.mockImplementation(() => fakeStream);
    });

    it('should be defined', () => {
        expect(exporter.generatePdf).toBeDefined();
    });

    it('should return a promise', () => {
        const returnValue = exporter.generatePdf(fakeDelta, fakeConfig);
        expect(returnValue).toBeInstanceOf(Promise);
    });

    it('should call getPdfStream and resolve with the blob', async () => {
        const promise = exporter.generatePdf(fakeDelta, fakeConfig);
        expect(mockPdfBuilder.prototype.getPdfStream).toHaveBeenCalledTimes(1);
        expect(mockPdfBuilder.prototype.getPdfStream).toHaveBeenCalledWith(undefined, fakeDelta, fakeConfig);
        expect(fakeStream.onRecord.event).toBe('finish');
        expect(fakeStream.onRecord.callback.toString().replace(/ /g, '').replace(/\n/g, '')).toBe('()=>{constblob=stream.toBlob(\'application/pdf\');resolve(blob);}');
    });

});