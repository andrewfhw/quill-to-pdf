
export class FakeStream {
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

export enum DocMethods {
    TEXT = 'TEXT',
    FONT = 'FONT',
    FONTSIZE = 'FONTSIZE',
    FILLCOLOR = 'FILLCOLOR',
    MOVEUP = 'MOVEUP',
    MOVEDOWN = 'MOVEDOWN',
    IMAGE = 'IMAGE',
    END = 'END',
    PIPE = 'PIPE'
};

export interface DocRecord {
    method: DocMethods,
    arguments: any[]
}

export class MockPDFDocument {
    endCalled: boolean;
    docRecord: DocRecord[];
    constructor() {
        this.endCalled = false;
        this.docRecord = [];
    }
    text(text: string, x: number , y: number, options: any) {
        this.docRecord.push({
            method: DocMethods.TEXT,
            arguments: [text, x, y, options]
        });
        return this;
    }
    pipe(arg: any) {
        
        return new FakeStream();
    }
    end() {
        
        this.endCalled = true;
        return this;
    }
    image(data: string, options: any) {
        this.docRecord.push({
            method: DocMethods.IMAGE,
            arguments: [data, options]
        });
        return;
    }
    font(fontName: string) {
        this.docRecord.push({
            method: DocMethods.FONT,
            arguments: [fontName]
        });
        return;
    }
    fontSize(size: number) {
        this.docRecord.push({
            method: DocMethods.FONTSIZE,
            arguments: [size]
        });
        return;
    }
    moveDown(lines?: number) {
        this.docRecord.push({
            method: DocMethods.MOVEDOWN,
            arguments: [lines]
        });
        return;
    }
    moveUp(lines?: number) {
        this.docRecord.push({
            method: DocMethods.MOVEUP,
            arguments: [lines]
        });
        return;
    }
    fillColor(color: string) {
        this.docRecord.push({
            method: DocMethods.FILLCOLOR,
            arguments: [color]
        });
        return;
    }
}