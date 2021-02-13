import { Config, RawOrParsedDelta } from './interfaces';
import { default as exporter, PdfExporter } from './pdf-exporter';


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
    let fakeStream: any;

    beforeEach(() => {
        fakeDelta = { ops: [{ insert: '\n' }] };
        fakeConfig = { exportAs: 'blob' };
        fakeStream = {
            onRecord: {
                event: '',
                callback: undefined
            },
            blobArg: '',
            on: function (event: string, callback: any) {
                this.onRecord = {
                    event: event,
                    callback: callback
                }
            },
            toBlob: function (app: string) {
                this.blobArg = app;
                return 'fakeblob';
            }
        }
    });

    it('should be defined', () => {
        expect(exporter.generatePdf).toBeDefined();
    });

    it('should return a promise', () => {
        const returnValue = exporter.generatePdf(fakeDelta, fakeConfig);
        expect(returnValue).toBeInstanceOf(Promise);
    });

    it('should call getPdfStream and resolve with the blob', async () => {
        const getPdfSpy = jest.spyOn(exporter.pdfBuilder, 'getPdfStream').mockReturnValue(fakeStream);
        const promise = exporter.generatePdf(fakeDelta, fakeConfig);
        expect(getPdfSpy).toHaveBeenCalledWith(undefined, fakeDelta, fakeConfig);
        expect(fakeStream.onRecord.event).toBe('finish');
        expect(fakeStream.onRecord.callback.toString().replace(/ /g, '').replace(/\n/g, '')).toBe('()=>{constblob=stream.toBlob(\'application/pdf\');resolve(blob);}');
    });

});