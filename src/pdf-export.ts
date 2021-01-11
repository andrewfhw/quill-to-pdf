import PDFDocument from './pdfkit.standalone';
import { Observable } from "rxjs";
import BlobStream from "./blob-stream";
import { Config, RawOrParsedDelta } from "./interfaces";
import { buildPdf, prepareInput } from "./pdf-builder";

export function generatePdf(delta: RawOrParsedDelta, config: Config): Promise<any> {
    return new Promise((resolve, reject) => {
        try {
            let doc: any;
            const stream = getPdfStream(doc, delta);
            stream.on('finish', () => {
                const blob = stream.toBlob('application/pdf');
                resolve(blob);
            });
        } catch (err) {
            reject(err);
        }
    });
}

function getPdfStream(doc: any, delta: RawOrParsedDelta) {
    const parsed = prepareInput(delta);
    doc = new PDFDocument() as any;
    const stream = doc.pipe(BlobStream() as any);
    buildPdf(parsed, doc);
    doc.end();
    return stream;
}