import { Config, RawOrParsedDelta } from './interfaces';
import {default as PdfBuilder } from './pdf-builder';

export class PdfExporter {

    readonly pdfBuilder: PdfBuilder;

    constructor() {
        this.pdfBuilder = new PdfBuilder();
    }

    // This is the function that should be called by external users.
    // Accepts a raw Quill delta or a parsed Quill delta (or an array of either)
    public generatePdf(delta: RawOrParsedDelta, config: Config): Promise<Blob | object> {
        return new Promise((resolve, reject) => {
            try {
                let doc: any;
                const stream = this.pdfBuilder.getPdfStream(doc, delta, config);
                stream.on('finish', () => {
                    const blob = stream.toBlob('application/pdf');
                    resolve(blob);
                });
            } catch (err) {
                reject(err);
            }
        });
    }
}

const exposedInstance = new PdfExporter();

export default exposedInstance;