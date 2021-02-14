![npm](https://img.shields.io/npm/v/quill-to-pdf) ![Travis (.com)](https://img.shields.io/travis/com/andrewraygilbert/quill-to-pdf) ![GitHub last commit](https://img.shields.io/github/last-commit/andrewraygilbert/quill-to-pdf) ![npm](https://img.shields.io/npm/dm/quill-to-pdf) ![GitHub issues](https://img.shields.io/github/issues/andrewraygilbert/quill-to-pdf) ![NPM](https://img.shields.io/npm/l/quill-to-pdf)

# QuillToPDF

**Simple Description**: Turn the content of your QuillJS editor into a downloadable PDF document.

**Technical Description***: Convert a QuillJS delta object into a .pdf BLOB.

Check out a live demo on [StackBlitz](https://stackblitz.com/edit/quill-to-pdf-demo?file=src/app/app.component.ts).

## How to Install

Install using npm:

`npm i quill-to-pdf --save`

## How Do I Use It?

Pass a QuillJS [delta](https://quilljs.com/docs/delta/) object to the `generatePdf()` function of the `pdfExporter` object, which is imported from the `quill-to-pdf` package. **Be sure** to `await` the `generatePdf()` function, because it returns a `Promise`.

```
const quillDelta = quillInstance.getContents();
const pdfBlob = pdfExporter.generatePdf(quillDelta);
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

Quill offers a wide range of [formatting features](https://quilljs.com/docs/formats/). QuillToPDF **does not currently support all Quill formatting features.**

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

Documentation for configuring the default styles is coming soon!