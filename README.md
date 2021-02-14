![npm](https://img.shields.io/npm/v/quill-to-pdf) ![Travis (.com)](https://img.shields.io/travis/com/andrewraygilbert/quill-to-pdf) ![GitHub last commit](https://img.shields.io/github/last-commit/andrewraygilbert/quill-to-pdf) ![npm](https://img.shields.io/npm/dm/quill-to-pdf) ![GitHub issues](https://img.shields.io/github/issues/andrewraygilbert/quill-to-pdf) ![NPM](https://img.shields.io/npm/l/quill-to-pdf)

# QuillToPDF

**Simple Description**: Turn the content of your QuillJS editor into a downloadable PDF document.

**Technical Description***: Convert a QuillJS delta object into a .pdf BLOB.

## How to Install

Install using npm:

`npm i quill-to-pdf --save`

## How Do I Use It?

Pass a QuillJS delta object to the `generatePdf()` function of the `pdfExporter` object, which is imported from the `quill-to-pdf` package. **Be sure** to `await` the `generatePdf()` function, because it returns a `Promise`.

```
const quillDelta = quillInstance.getContents();
const pdfBlob = pdfExporter.generatePdf(quillDelta);
```

The `quillInstance` refers to the object created by `new Quill()`.