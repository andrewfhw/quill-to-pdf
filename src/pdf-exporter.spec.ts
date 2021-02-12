import { RunAttributes } from 'quilljs-parser';
import { TextBase } from './interfaces';
import PDFDocument from './pdfkit.standalone';
import { setBoldFont, setPreRunAttributes, setRunAttributes, setRunSize } from './pdf-exporter';

describe('pdfexporter', () => {

    let doc: any;

    describe('setBoldFont', () => {

        let fontSpy: any;

        beforeEach(() => {
            doc = new PDFDocument();
            fontSpy = jest.spyOn(doc, 'font');
        });

        it('should bold Times', () => {
            setBoldFont('Times-Roman', doc);
            expect(fontSpy).toHaveBeenCalledWith('Times-Bold');
        });

        it('should bold courier', () => {
            setBoldFont('Courier', doc);
            expect(fontSpy).toHaveBeenCalledWith('Courier-Bold');
        });

        it('should bold Helvetica', () => {
            setBoldFont('Helvetica', doc);
            expect(fontSpy).toHaveBeenCalledWith('Helvetica-Bold');
        });

    });

    describe('setRunSize', () => {

        let sizeSpy: any;

        beforeEach(() => {
            doc = new PDFDocument();
            sizeSpy = jest.spyOn(doc, 'fontSize');
        });

        it('should transform size to small', () => {
            setRunSize('small', 12, doc);
            expect(sizeSpy).toHaveBeenCalledWith(8);
        });

        it('should transform size to large', () => {
            setRunSize('large', 12, doc);
            expect(sizeSpy).toHaveBeenCalledWith(16);
        });

        it('should transform size to huge', () => {
            setRunSize('huge', 12, doc);
            expect(sizeSpy).toHaveBeenCalledWith(18);
        });

    });

    describe('setRunAttributes', () => {

        beforeEach(() => {
            doc = new PDFDocument();
        });

        it('should underline the text', () => {
            const input: RunAttributes = {
                underline: true
            };
            const output = {
                underline: true,
                strike: false,
                oblique: false, 
                link: null,
                continued: true
            };
            const result = setRunAttributes(input, false);
            expect(result).toEqual(output);
        });

        it('should strike the text', () => {
            const input: RunAttributes = {
                strike: true
            };
            const output = {
                underline: false,
                strike: true,
                oblique: false,
                link: null,
                continued: false
            };
            const result = setRunAttributes(input, true);
            expect(result).toEqual(output);
        });

        it('should oblique', () => {
            const input: RunAttributes = {
                italic: true
            };
            const output = {
                underline: false,
                strike: false,
                oblique: true,
                link: null,
                continued: true
            };
            const result = setRunAttributes(input, false);
            expect(result).toEqual(output);
        });

        it('should be a link', () => {
            const input: RunAttributes = {
                link: 'google.com'
            };
            const output = {
                underline: false,
                strike: false,
                oblique: false,
                link: 'google.com',
                continued: true
            };
            const result = setRunAttributes(input, false);
            expect(result).toEqual(output);

        });

        it('should be underline and link', () => {
            const input: RunAttributes = {
                underline: true,
                link: 'google.com'
            };
            const output = {
                underline: true,
                strike: false,
                oblique: false,
                link: 'google.com',
                continued: true
            };
            const result = setRunAttributes(input, false);
            expect(output).toEqual(result);
        });

    });

    describe('setPreRunAttributes', () => {

        let fillSpy: any;
        let runSizeSpy: any;

        beforeEach(() => {
            doc = new PDFDocument();
            fillSpy = jest.spyOn(doc, 'fillColor');
        });

        it('should set the run size', () => {
            const attr: RunAttributes = {
                size: 'small',
                bold: true
            };
            const base: TextBase = {
                font: 'Times-Roman',
                fontSize: 12
            };
            setPreRunAttributes(attr, base, doc);
        });

        it.todo('should set font to bold');

        it.todo('should set fill color based on link or no link');

    });

});