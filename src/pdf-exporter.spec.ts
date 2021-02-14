jest.mock('./pdf-builder');

import { default as PdfBuilder } from './pdf-builder';
import { Config, RawOrParsedDelta } from './interfaces';
import { default as exporter, PdfExporter } from './pdf-exporter';

const mockPdfBuilder = PdfBuilder as jest.MockedClass<typeof PdfBuilder>;

class FakeStream {
    onRecord: any;
    blobArg: string;
    constructor() {
        this.onRecord = undefined;
        this.blobArg = '';
    }
    on(event: string, callback: any) {
        this.onRecord = {
            event: event,
            callback: callback
        }
    }
    toBlob(app: string) {
        this.blobArg = app;
        return 'fakeblob';
    }
}

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
        fakeConfig = { exportAs: 'blob' };
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