![npm](https://img.shields.io/npm/v/quill-to-pdf) ![Travis (.com)](https://img.shields.io/travis/com/andrewraygilbert/quill-to-pdf) ![GitHub last commit](https://img.shields.io/github/last-commit/andrewraygilbert/quill-to-pdf) ![npm](https://img.shields.io/npm/dm/quill-to-pdf) ![GitHub issues](https://img.shields.io/github/issues/andrewraygilbert/quill-to-pdf) ![NPM](https://img.shields.io/npm/l/quill-to-pdf)

# QuillToPDF

**Simple Description**: Turn the content of your QuillJS editor into a downloadable PDF document.

**Technical Description**: Convert a QuillJS delta object into a .pdf BLOB.

Check out a live demo on [StackBlitz](https://stackblitz.com/edit/quill-to-pdf-demo?file=src/app/app.component.ts).

## How to Install

Install using npm:

`npm i quill-to-pdf --save`

## How Do I Use It?

Pass a QuillJS [delta](https://quilljs.com/docs/delta/) object to the `generatePdf()` function of the `pdfExporter` object, which is imported from the `quill-to-pdf` package. **Be sure** to `await` the `generatePdf()` function, because it returns a `Promise`.

```javascript
const quillDelta = quillInstance.getContents();
const pdfBlob = await pdfExporter.generatePdf(quillDelta);
```

The `quillInstance` refers to the object created by `new Quill()`. The `pdfExporter` refers to the default export of the `quill-to-pdf` package, which can be imported as follows: 

`import { pdfExporter } from 'quill-to-pdf';`

## What Does the Package Do?

This package creates a PDF from a QuillJS delta. In short, this package will allow you to download the contents of your QuillJS in-browser editor as a PDF document.

## How Does It Work?

QuillJS stores its editor content in a "delta" format. QuillToPdf parses the Quill delta object using the `quilljs-parser` package and then generates a PDF from the parsed Quill delta using the PDFKit package.

## How Can I Download the PDF Document from the Browser?

You can download the PDF document created by QuillToPDF by using the [FileSaver](https://www.npmjs.com/package/file-saver) package.

You'll need to install `file-saver` from npm first.

```npm i file-saver --save```

You can also install the types, if you're using TypeScript.

```npm i @types/file-saver --save-dev```

Here is a brief example of how to download the PDF document from the browser.

```javascript
import { saveAs } from 'file-saver';
import { pdfExporter } from 'quill-to-pdf';
import * as quill from 'quilljs';

// Here is your Quill editor instance
const quillInstance = new Quill();

// Here is your export function
// Typically this would be triggered by a click on an export button
async function export() {
    const delta = quillInstance.getContents(); // gets the Quill delta
    const pdfAsBlob = await pdfExporter.generatePdf(delta); // converts to PDF
    saveAs(pdfAsBlob, 'pdf-export.pdf'); // downloads from the browser
}

```

## Which QuillJS Formatting Features Are Supported?

Quill offers a wide range of [formatting features](https://quilljs.com/docs/formats/). QuillToPDF **does not currently support all Quill formatting features.** This is because replicating some of the QuillJS formats using PDFKit, which this package relies on, is complicated.

The following features are **fully** supported:

* Bold
* Italic
* Font
* Link
* Size
* Strikethrough
* Underline
* Header 1
* Header 2
* List
    * Bullet
    * Ordered
* Block Quote
* Code Block

The following features are only **partially** supported:

* Formula (the raw text of the formula will be inserted into the PDF, not the KaTex formatted version)
* Image (the image will be inserted with absolute width and height settings)
* Video (the link to the video will be included in the PDF document)

The following features are **NOT** supported:

* Text direction (cannot be switched to right-to-left)
* Background (cannot color the background of the text)
* Superscript
* Subscript
* Color
* Inline code
* Indent (but indents for lists ARE supported)

## How Can I Configure QuillToPDF?

Currently, QuillToPDF allows you to configure the styles used for the main text formats that appear in a Quill editor.

Six text formats are currently recognized by QuillToPDF:

1. **Normal**&mdash;refers to basic text (`normal`)
2. **Header 1**&mdash;refers to a level one heading (`header_1`)
3. **Header 2**&mdash;refers to a level two heading (`header_2`)
4. **Block Quote**&mdash;refers to a block quote (`block_quote`)
5. **Code Block**&mdash;refers to a block of code (`code_block`)
6. **List Paragraph**&mdash;refers to the text in a bulleted or ordered list (`list_paragraph`)

QuillToPDF provides default styles for each of these six text formats. For instance, `normal` text is automatically formatted as Times-Roman font and 12 points in size, whereas `header_1` text is automatically formatted as Helvetica-Bold font and 16 points in size.

The default styles for the 6 text formats can be overridden by providing a style configuration object as the **second argument** to the `generatePdf()` function.

The configuration object should satisfy the following interface:

```javascript
interface Config {
    styles: {
        normal?: {
            font?: string;
            fontSize?: number; // specified in points
            baseIndent?: number; // specified in points w/ 72 ppi
            levelIndent?: number; // only used for lists
            indent?: {
                left?: number;
                right?: number;
            }
        }
    }
}
```

The object in the `styles` property above can contain a key for any of the six text formats: `normal`, `header_1`, `header_2`, `block_quote`, `code_block`, or `list_paragraph`. 

For example, if I want to override the default style for a level one heading, I could do the following:

```javascript
// create a configuration object that satisfies the interface above
const config: Config = {
    styles: {
        header_1: {
            font: 'Times-Bold', // default is 'Helvetica-Bold'
            fontSize: 18 // default is 16
        }
    }
};

// pass the configuration object as the second argument to generatePdf()
const pdfBlob = await pdfExporter.generatePdf(quillDelta, config);
```

The options for font are limited to those that come pre-packaged with PDFKit:

- `'Courier'`
- `'Courier-Bold'`
- `'Courier-Oblique'`
- `'Courier-BoldOblique'`
- `'Helvetica'`
- `'Helvetica-Bold'`
- `'Helvetica-Oblique'`
- `'Helvetica-BoldOblique'`
- `'Times-Roman'`
- `'Times-Bold'`
- `'Times-Italic'`
- `'Times-BoldItalic'`

Again, check out the demo on [StackBlitz](https://stackblitz.com/edit/quill-to-pdf-demo?file=src/app/app.component.ts).