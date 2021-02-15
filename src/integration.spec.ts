jest.mock("./pdfkit.standalone");

import { ParsedQuillDelta } from "quilljs-parser";
import PDFDocument, { unenroll } from "./pdfkit.standalone";
import { DocMethods, DocRecord, MockPDFDocument } from "./test-utilities";
import { default as exporter } from "./pdf-exporter";
import { Config } from "./interfaces";

const mockPdfKit = PDFDocument as jest.MockedClass<typeof PDFDocument>;

let mockDoc: MockPDFDocument;

mockPdfKit.mockImplementation(() => {
  const doc = new MockPDFDocument();
  mockDoc = doc as MockPDFDocument;
  return doc as any;
});

describe("parsed deltas", () => {
  it("should handle a simple parsed quill delta", async () => {
    const fakeDelta: ParsedQuillDelta = {
      setup: {
        hyperlinks: [],
        numberedLists: 0,
      },
      paragraphs: [
        {
          textRuns: [
            {
              text: "hello",
            },
          ],
        },
      ],
    };
    const output: DocRecord[] = [
      {
        method: DocMethods.MOVEDOWN,
        arguments: [undefined],
      },
      {
        method: DocMethods.FONT,
        arguments: ["Times-Roman"],
      },
      {
        method: DocMethods.FONTSIZE,
        arguments: [12],
      },
      {
        method: DocMethods.FILLCOLOR,
        arguments: ["black"],
      },
      {
        method: DocMethods.TEXT,
        arguments: [
          "hello",
          72,
          null,
          {
            underline: false,
            strike: false,
            oblique: false,
            link: null,
            continued: false,
          },
        ],
      },
    ];
    exporter.generatePdf(fakeDelta);
    expect(mockDoc.docRecord).toEqual(output);
  });

  it("should handle multiple paragraphs", async () => {
    const fakeDelta: ParsedQuillDelta = {
      setup: {
        hyperlinks: [],
        numberedLists: 0,
      },
      paragraphs: [
        {
          textRuns: [
            {
              text:
                "This is the first paragraph of the document. This is just some basic text.",
            },
          ],
        },
        {
          textRuns: [
            {
              text: "Here is the second paragraph of the document.",
            },
          ],
        },
      ],
    };
    const output: DocRecord[] = [
      {
        method: DocMethods.MOVEDOWN,
        arguments: [undefined],
      },
      {
        method: DocMethods.FONT,
        arguments: ["Times-Roman"],
      },
      {
        method: DocMethods.FONTSIZE,
        arguments: [12],
      },
      {
        method: DocMethods.FILLCOLOR,
        arguments: ["black"],
      },
      {
        method: DocMethods.TEXT,
        arguments: [
          "This is the first paragraph of the document. This is just some basic text.",
          72,
          null,
          {
            underline: false,
            strike: false,
            oblique: false,
            link: null,
            continued: false,
          },
        ],
      },
      {
        method: DocMethods.MOVEDOWN,
        arguments: [undefined],
      },
      {
        method: DocMethods.FONT,
        arguments: ["Times-Roman"],
      },
      {
        method: DocMethods.FONTSIZE,
        arguments: [12],
      },
      {
        method: DocMethods.FILLCOLOR,
        arguments: ["black"],
      },
      {
        method: DocMethods.TEXT,
        arguments: [
          "Here is the second paragraph of the document.",
          72,
          null,
          {
            underline: false,
            strike: false,
            oblique: false,
            link: null,
            continued: false,
          },
        ],
      },
    ];

    exporter.generatePdf(fakeDelta);
    expect(mockDoc.docRecord).toEqual(output);
  });

  it("should handle formatted text runs", () => {
    const fakeDelta: ParsedQuillDelta = {
      setup: {
        hyperlinks: [],
        numberedLists: 0,
      },
      paragraphs: [
        {
          textRuns: [
            {
              text: "Here is some simple text. ",
            },
            {
              text: "Now this text will be bolded. ",
              attributes: {
                bold: true,
              },
            },
            {
              text: "And then back to normal. ",
            },
          ],
        },
        {
          textRuns: [
            {
              text: "Normal text.",
            },
            {
              text: "This is underlined. ",
              attributes: {
                underline: true,
              },
            },
            {
              text: "This has a strike. ",
              attributes: {
                strike: true,
              },
            },
            {
              text: "This is italicized. ",
              attributes: {
                italic: true,
              },
            },
          ],
        },
      ],
    };
    const output: DocRecord[] = [
      {
        method: DocMethods.MOVEDOWN,
        arguments: [undefined],
      },
      {
        method: DocMethods.FONT,
        arguments: ["Times-Roman"],
      },
      {
        method: DocMethods.FONTSIZE,
        arguments: [12],
      },
      {
        method: DocMethods.FILLCOLOR,
        arguments: ["black"],
      },
      {
        method: DocMethods.TEXT,
        arguments: [
          "Here is some simple text. ",
          72,
          null,
          {
            underline: false,
            strike: false,
            oblique: false,
            link: null,
            continued: true,
          },
        ],
      },
      {
        method: DocMethods.FONT,
        arguments: ["Times-Roman"],
      },
      {
        method: DocMethods.FONTSIZE,
        arguments: [12],
      },
      {
        method: DocMethods.FONT,
        arguments: ["Times-Bold"],
      },
      {
        method: DocMethods.FILLCOLOR,
        arguments: ["black"],
      },
      {
        method: DocMethods.TEXT,
        arguments: [
          "Now this text will be bolded. ",
          72,
          null,
          {
            underline: false,
            strike: false,
            oblique: false,
            link: null,
            continued: true,
          },
        ],
      },
      {
        method: DocMethods.FONT,
        arguments: ["Times-Roman"],
      },
      {
        method: DocMethods.FONTSIZE,
        arguments: [12],
      },
      {
        method: DocMethods.FILLCOLOR,
        arguments: ["black"],
      },
      {
        method: DocMethods.TEXT,
        arguments: [
          "And then back to normal. ",
          72,
          null,
          {
            underline: false,
            strike: false,
            oblique: false,
            link: null,
            continued: false,
          },
        ],
      },
      {
        method: DocMethods.MOVEDOWN,
        arguments: [undefined],
      },
      {
        method: DocMethods.FONT,
        arguments: ["Times-Roman"],
      },
      {
        method: DocMethods.FONTSIZE,
        arguments: [12],
      },
      {
        method: DocMethods.FILLCOLOR,
        arguments: ["black"],
      },
      {
        method: DocMethods.TEXT,
        arguments: [
          "Normal text.",
          72,
          null,
          {
            underline: false,
            strike: false,
            oblique: false,
            link: null,
            continued: true,
          },
        ],
      },
      {
        method: DocMethods.FONT,
        arguments: ["Times-Roman"],
      },
      {
        method: DocMethods.FONTSIZE,
        arguments: [12],
      },
      {
        method: DocMethods.FILLCOLOR,
        arguments: ["black"],
      },
      {
        method: DocMethods.TEXT,
        arguments: [
          "This is underlined. ",
          72,
          null,
          {
            underline: true,
            strike: false,
            oblique: false,
            link: null,
            continued: true,
          },
        ],
      },
      {
        method: DocMethods.FONT,
        arguments: ["Times-Roman"],
      },
      {
        method: DocMethods.FONTSIZE,
        arguments: [12],
      },
      {
        method: DocMethods.FILLCOLOR,
        arguments: ["black"],
      },
      {
        method: DocMethods.TEXT,
        arguments: [
          "This has a strike. ",
          72,
          null,
          {
            underline: false,
            strike: true,
            oblique: false,
            link: null,
            continued: true,
          },
        ],
      },
      {
        method: DocMethods.FONT,
        arguments: ["Times-Roman"],
      },
      {
        method: DocMethods.FONTSIZE,
        arguments: [12],
      },
      {
        method: DocMethods.FILLCOLOR,
        arguments: ["black"],
      },
      {
        method: DocMethods.TEXT,
        arguments: [
          "This is italicized. ",
          72,
          null,
          {
            underline: false,
            strike: false,
            oblique: true,
            link: null,
            continued: false,
          },
        ],
      },
    ];

    exporter.generatePdf(fakeDelta);
    expect(mockDoc.docRecord).toEqual(output);
  });

  it("should handle links", () => {
    const fakeDelta: ParsedQuillDelta = {
      setup: {
        hyperlinks: [
          {
            text: "Google",
            link: "https://google.com",
          },
        ],
        numberedLists: 0,
      },
      paragraphs: [
        {
          textRuns: [
            {
              text: "I am just writing a normal paragraph here with a link to ",
            },
            {
              text: "Google",
              attributes: {
                link: "https://google.com",
              },
            },
            {
              text: ". And then I will add another link to ",
            },
            {
              text: "GitHub",
              attributes: {
                link: "https://github.io",
              },
            },
          ],
        },
      ],
    };
    const output: DocRecord[] = [
      {
        method: DocMethods.MOVEDOWN,
        arguments: [undefined],
      },
      {
        method: DocMethods.FONT,
        arguments: ["Times-Roman"],
      },
      {
        method: DocMethods.FONTSIZE,
        arguments: [12],
      },
      {
        method: DocMethods.FILLCOLOR,
        arguments: ["black"],
      },
      {
        method: DocMethods.TEXT,
        arguments: [
          "I am just writing a normal paragraph here with a link to ",
          72,
          null,
          {
            underline: false,
            strike: false,
            oblique: false,
            link: null,
            continued: true,
          },
        ],
      },
      {
        method: DocMethods.FONT,
        arguments: ["Times-Roman"],
      },
      {
        method: DocMethods.FONTSIZE,
        arguments: [12],
      },
      {
        method: DocMethods.FILLCOLOR,
        arguments: ["blue"],
      },
      {
        method: DocMethods.TEXT,
        arguments: [
          "Google",
          72,
          null,
          {
            underline: false,
            strike: false,
            oblique: false,
            link: "https://google.com",
            continued: true,
          },
        ],
      },
      {
        method: DocMethods.FONT,
        arguments: ["Times-Roman"],
      },
      {
        method: DocMethods.FONTSIZE,
        arguments: [12],
      },
      {
        method: DocMethods.FILLCOLOR,
        arguments: ["black"],
      },
      {
        method: DocMethods.TEXT,
        arguments: [
          ". And then I will add another link to ",
          72,
          null,
          {
            underline: false,
            strike: false,
            oblique: false,
            link: null,
            continued: true,
          },
        ],
      },
      {
        method: DocMethods.FONT,
        arguments: ["Times-Roman"],
      },
      {
        method: DocMethods.FONTSIZE,
        arguments: [12],
      },
      {
        method: DocMethods.FILLCOLOR,
        arguments: ["blue"],
      },
      {
        method: DocMethods.TEXT,
        arguments: [
          "GitHub",
          72,
          null,
          {
            underline: false,
            strike: false,
            oblique: false,
            link: "https://github.io",
            continued: false,
          },
        ],
      },
    ];

    exporter.generatePdf(fakeDelta);
    expect(mockDoc.docRecord).toEqual(output);
  });

  describe("embeds", () => {

    it('should handle a video embed', () => {
        const fakeDelta: ParsedQuillDelta = {
            setup: {
                hyperlinks: [],
                numberedLists: 0
            },
            paragraphs: [{
                textRuns: [{
                    text: 'This will test a video embed. '
                }]
            },{
                embed: {
                    video: 'https://thelinktothevideo.com'
                }
            },{
                textRuns: [{
                    text: 'And that\'s the end.'
                }]
            }]
        };
        const output: DocRecord[] = [{
            method: DocMethods.MOVEDOWN,
            arguments: [undefined]
        },{
            method: DocMethods.FONT,
            arguments: ['Times-Roman']
        },{
            method: DocMethods.FONTSIZE,
            arguments: [12]
        },{
            method: DocMethods.FILLCOLOR,
            arguments: ['black']
        },{
            method: DocMethods.TEXT,
            arguments: ['This will test a video embed. ', 72, null, {
                underline: false,
                strike: false,
                oblique: false,
                link: null,
                continued: false
            }]
        },{
            method: DocMethods.MOVEDOWN,
            arguments: [undefined]
        },{
            method: DocMethods.MOVEDOWN,
            arguments: [undefined]
        },{
            method: DocMethods.FONT,
            arguments: ['Times-Roman']
        },{
            method: DocMethods.FONTSIZE,
            arguments: [12]
        },{
            method: DocMethods.FILLCOLOR,
            arguments: ['blue']
        },{
            method: DocMethods.TEXT,
            arguments: ['https://thelinktothevideo.com', 72, null, {
                underline: false,
                strike: false,
                oblique: false,
                link: 'https://thelinktothevideo.com',
                continued: false
            }]
        },{
            method: DocMethods.MOVEDOWN,
            arguments: [undefined]
        },{
            method: DocMethods.FONT,
            arguments: ['Times-Roman']
        },{
            method: DocMethods.FONTSIZE,
            arguments: [12]
        },{
            method: DocMethods.FILLCOLOR,
            arguments: ['black']
        },{
            method: DocMethods.TEXT,
            arguments: ['And that\'s the end.', 72, null, {
                underline: false,
                strike: false,
                oblique: false,
                link: null,
                continued: false
            }]
        }];
        exporter.generatePdf(fakeDelta);
        expect(mockDoc.docRecord).toEqual(output);
    });

  });


  it('should handle an image embed', () => {
    const fakeDelta: ParsedQuillDelta = {
        setup: {
            hyperlinks: [],
            numberedLists: 0
        },
        paragraphs: [{
            textRuns: [{
                text: 'Below is an image. '
            }]
        },{
            embed: {
                image: 'base64string'
            }
        }]
    };
    const output: DocRecord[] = [{
        method: DocMethods.MOVEDOWN,
        arguments: [undefined]
    },{
        method: DocMethods.FONT,
        arguments: ['Times-Roman']
    },{
        method: DocMethods.FONTSIZE,
        arguments: [12]
    },{
        method: DocMethods.FILLCOLOR,
        arguments: ['black']
    },{
        method: DocMethods.TEXT,
        arguments: ['Below is an image. ', 72, null, {
            underline: false,
            strike: false,
            oblique: false,
            link: null,
            continued: false
        }]
    },{
        method: DocMethods.MOVEDOWN,
        arguments: [undefined]
    },{
        method: DocMethods.MOVEDOWN,
        arguments: [undefined]
    },{
        method: DocMethods.IMAGE,
        arguments: ['base64string', {
            fit: [200, 200],
            align: 'center'
        }]
    }];
    exporter.generatePdf(fakeDelta);
    expect(mockDoc.docRecord).toEqual(output);
  });


  it('should handle a formula embed', () => {
      const fakeDelta: ParsedQuillDelta = {
          setup: {
              hyperlinks: [],
              numberedLists: 0
          },
          paragraphs: [{
              textRuns: [{
                  text: 'Here we will enter a formula into the text like this '
              },{
                  formula: 'y = mx + b'
              }]
          }]
      };
      const output: DocRecord[] = [{
          method: DocMethods.MOVEDOWN,
          arguments: [undefined]
      },{
        method: DocMethods.FONT,
        arguments: ['Times-Roman']
    },{
        method: DocMethods.FONTSIZE,
        arguments: [12]
    },{
        method: DocMethods.FILLCOLOR,
        arguments: ['black']
    },{
        method: DocMethods.TEXT,
        arguments: ['Here we will enter a formula into the text like this ', 72, null, {
            underline: false,
            strike: false,
            oblique: false,
            link: null,
            continued: true
        }]
    },{
        method: DocMethods.FONT,
        arguments: ['Times-Roman']
    },{
        method: DocMethods.FONTSIZE,
        arguments: [12]
    },{
        method: DocMethods.FILLCOLOR,
        arguments: ['black']
    },{
        method: DocMethods.TEXT,
        arguments: ['y = mx + b', 72, null, {
            underline: false,
            strike: false,
            oblique: false,
            link: null,
            continued: false
        }]
    }];
    exporter.generatePdf(fakeDelta);
    expect(mockDoc.docRecord).toEqual(output);
  });


  it('should handle headings', () => {

    const fakeDelta: ParsedQuillDelta = {
        setup: {
            hyperlinks: [],
            numberedLists: 0
        },
        paragraphs: [{
            textRuns: [{
                text: 'Here is a heading'
            }],
            attributes: {
                header: 1
            }
        },{
            textRuns: [{
                text: 'Some normal text here. '
            }]
        },{
            textRuns: [{
                text: 'And a level two heading'
            }],
            attributes: {
                header: 2
            }
        },{
            textRuns: [{
                text: 'back to normal'
            }]
        }]
    };
    const output: DocRecord[] = [{
        method: DocMethods.MOVEDOWN,
        arguments: [undefined]
    },{
        method: DocMethods.FONT,
        arguments: ['Helvetica-Bold']
    },{
        method: DocMethods.FONTSIZE,
        arguments: [16]
    },{
        method: DocMethods.FILLCOLOR,
        arguments: ['black']
    },{
        method: DocMethods.TEXT,
        arguments: ['Here is a heading', 72, null, {
            underline: false,
            strike: false,
            oblique: false,
            link: null,
            continued: false
        }]
    },{
        method: DocMethods.MOVEDOWN,
        arguments: [undefined]
    },{
        method: DocMethods.FONT,
        arguments: ['Times-Roman']
    },{
        method: DocMethods.FONTSIZE,
        arguments: [12]
    },{
        method: DocMethods.FILLCOLOR,
        arguments: ['black']
    },{
        method: DocMethods.TEXT,
        arguments: ['Some normal text here. ', 72, null, {
            underline: false,
            strike: false,
            oblique: false,
            link: null,
            continued: false
        }]
    },{
        method: DocMethods.MOVEDOWN,
        arguments: [undefined]
    },{
        method: DocMethods.FONT,
        arguments: ['Helvetica-Bold']
    },{
        method: DocMethods.FONTSIZE,
        arguments: [14]
    },{
        method: DocMethods.FILLCOLOR,
        arguments: ['black']
    },{
        method: DocMethods.TEXT,
        arguments: ['And a level two heading', 72, null, {
            underline: false,
            strike: false,
            oblique: false,
            link: null,
            continued: false
        }]
    },{
        method: DocMethods.MOVEDOWN,
        arguments: [undefined]
    },{
        method: DocMethods.FONT,
        arguments: ['Times-Roman']
    },{
        method: DocMethods.FONTSIZE,
        arguments: [12]
    },{
        method: DocMethods.FILLCOLOR,
        arguments: ['black']
    },{
        method: DocMethods.TEXT,
        arguments: ['back to normal', 72, null, {
            underline: false,
            strike: false,
            oblique: false,
            link: null,
            continued: false
        }]
    }];
    exporter.generatePdf(fakeDelta);
    expect(mockDoc.docRecord).toEqual(output);

  });


  it('should handle block quote', () => {

    const fakeDelta: ParsedQuillDelta = {
        setup: {
            hyperlinks: [],
            numberedLists: 0
        },
        paragraphs: [{
            textRuns: [{
                text: 'Start with some normal text.'
            }]
        },{
            textRuns: [{
                text: 'This text is a block quote. '
            }],
            attributes: {
                blockquote: true
            }
        },{
            textRuns: [{
                text: 'Back to normal.'
            }]
        }]
    };
    const output: DocRecord[] = [{
        method: DocMethods.MOVEDOWN,
        arguments: [undefined]
    },{
        method: DocMethods.FONT,
        arguments: ['Times-Roman']
    },{
        method: DocMethods.FONTSIZE,
        arguments: [12]
    },{
        method: DocMethods.FILLCOLOR,
        arguments: ['black']
    },{
        method: DocMethods.TEXT,
        arguments: ['Start with some normal text.', 72, null, {
            underline: false,
            strike: false,
            oblique: false,
            link: null,
            continued: false
        }]
    },{
        method: DocMethods.MOVEDOWN,
        arguments: [undefined]
    },{
        method: DocMethods.FONT,
        arguments: ['Times-Italic']
    },{
        method: DocMethods.FONTSIZE,
        arguments: [12]
    },{
        method: DocMethods.FILLCOLOR,
        arguments: ['black']
    },{
        method: DocMethods.TEXT,
        arguments: ['This text is a block quote. ', 72, null, {
            underline: false,
            strike: false,
            oblique: false,
            link: null,
            continued: false
        }]
    },{
        method: DocMethods.MOVEDOWN,
        arguments: [undefined]
    },{
        method: DocMethods.FONT,
        arguments: ['Times-Roman']
    },{
        method: DocMethods.FONTSIZE,
        arguments: [12]
    },{
        method: DocMethods.FILLCOLOR,
        arguments: ['black']
    },{
        method: DocMethods.TEXT,
        arguments: ['Back to normal.', 72, null, {
            underline: false,
            strike: false,
            oblique: false,
            link: null,
            continued: false
        }]
    }]

  });


  it('should handle a code block', () => {

    const fakeDelta: ParsedQuillDelta = {
        setup: {
            hyperlinks: [],
            numberedLists: 0
        },
        paragraphs: [{
            textRuns: [{
                text: 'Basic text here.'
            }]
        },{
            textRuns: [{
                text: 'const variable = new Object();'
            }],
            attributes: {
                "code-block": true
            }
        }]
    };
    const output: DocRecord[] = [{
        method: DocMethods.MOVEDOWN,
        arguments: [undefined]
    },{
        method: DocMethods.FONT,
        arguments: ['Times-Roman']
    },{
        method: DocMethods.FONTSIZE,
        arguments: [12]
    },{
        method: DocMethods.FILLCOLOR,
        arguments: ['black']
    },{
        method: DocMethods.TEXT,
        arguments: ['Basic text here.', 72, null, {
            underline: false,
            strike: false,
            oblique: false,
            link: null,
            continued: false
        }]
    },{
        method: DocMethods.MOVEDOWN,
        arguments: [undefined]
    },{
        method: DocMethods.FONT,
        arguments: ['Courier']
    },{
        method: DocMethods.FONTSIZE,
        arguments: [12]
    },{
        method: DocMethods.FILLCOLOR,
        arguments: ['black']
    },{
        method: DocMethods.TEXT,
        arguments: ['const variable = new Object();', 72, null, {
            underline: false,
            strike: false,
            oblique: false,
            link: null,
            continued: false
        }]
    }];
    exporter.generatePdf(fakeDelta);
    expect(mockDoc.docRecord).toEqual(output);

  });


  it('should build a bullet list', () => {

    const fakeDelta: ParsedQuillDelta = {
        setup: {
            hyperlinks: [],
            numberedLists: 0
        },
        paragraphs: [{
            textRuns: [{
                text: 'Some normal text here.'
            }]
        },{
            textRuns: [{
                text: 'This is the first bullet point.'
            }],
            attributes: {
                list: 'bullet'
            }
        },{
            textRuns: [{
                text: 'This is the second bullet point.'
            }],
            attributes: {
                list: 'bullet'
            }
        },{
            textRuns: [{
                text: 'Level two bullet point.'
            }],
            attributes: {
                list: 'bullet',
                indent: 1
            }
        },{
            textRuns: [{
                text: 'Another level two bullet point.'
            }],
            attributes: {
                list: 'bullet',
                indent: 1
            }
        },{
            textRuns: [{
                text: 'A level three bullet point.'
            }],
            attributes: {
                list: 'bullet',
                indent: 2
            }
        },{
            textRuns: [{
                text: 'Back to level one.'
            }],
            attributes: {
                list: 'bullet'
            }
        }]
    };
    const output: DocRecord[] = [{
        method: DocMethods.MOVEDOWN,
        arguments: [undefined]
    },{
        method: DocMethods.FONT,
        arguments: ['Times-Roman']
    },{
        method: DocMethods.FONTSIZE,
        arguments: [12]
    },{
        method: DocMethods.FILLCOLOR,
        arguments: ['black']
    },{
        method: DocMethods.TEXT,
        arguments: ['Some normal text here.', 72, null, {
            underline: false,
            strike: false,
            oblique: false,
            link: null,
            continued: false
        }]
    },{
        method: DocMethods.MOVEDOWN,
        arguments: [undefined]
    },{
        method: DocMethods.FONT,
        arguments: ['Times-Roman']
    },{
        method: DocMethods.FONTSIZE,
        arguments: [12]
    },{
        method: DocMethods.FILLCOLOR,
        arguments: ['black']
    },{
        method: DocMethods.TEXT,
        arguments: ['\u2022', 50 + 25, null, {
            width: (72*6.5) - (3 + 50 + 25),
            continued: false
        }]
    },{
        method: DocMethods.MOVEUP,
        arguments: [undefined]
    },{
        method: DocMethods.FONT,
        arguments: ['Times-Roman']
    },{
        method: DocMethods.FONTSIZE,
        arguments: [12]
    },{
        method: DocMethods.FILLCOLOR,
        arguments: ['black']
    },{
        method: DocMethods.TEXT,
        arguments: ['This is the first bullet point.', 50 + 25 + 3 + 25, null, {
            underline: false,
            strike: false,
            oblique: false,
            link: null,
            continued: false
        }]
    },{
        method: DocMethods.MOVEDOWN,
        arguments: [undefined]
    },{
        method: DocMethods.FONT,
        arguments: ['Times-Roman']
    },{
        method: DocMethods.FONTSIZE,
        arguments: [12]
    },{
        method: DocMethods.FILLCOLOR,
        arguments: ['black']
    },{
        method: DocMethods.TEXT,
        arguments: ['\u2022', 50 + 25, null, {
            width: (72*6.5) - (3 + 50 + 25),
            continued: false
        }]
    },{
        method: DocMethods.MOVEUP,
        arguments: [undefined]
    },{
        method: DocMethods.FONT,
        arguments: ['Times-Roman']
    },{
        method: DocMethods.FONTSIZE,
        arguments: [12]
    },{
        method: DocMethods.FILLCOLOR,
        arguments: ['black']
    },{
        method: DocMethods.TEXT,
        arguments: ['This is the second bullet point.', 50 + 25 + 3 + 25, null, {
            underline: false,
            strike: false,
            oblique: false,
            link: null,
            continued: false
        }]
    },{
        method: DocMethods.MOVEDOWN,
        arguments: [undefined]
    },{
        method: DocMethods.FONT,
        arguments: ['Times-Roman']
    },{
        method: DocMethods.FONTSIZE,
        arguments: [12]
    },{
        method: DocMethods.FILLCOLOR,
        arguments: ['black']
    },{
        method: DocMethods.TEXT,
        arguments: ['\u2022', 50 + 25 + 25, null, {
            width: (72*6.5) - (3 + 50 + 25 + 25),
            continued: false
        }]
    },{
        method: DocMethods.MOVEUP,
        arguments: [undefined]
    },{
        method: DocMethods.FONT,
        arguments: ['Times-Roman']
    },{
        method: DocMethods.FONTSIZE,
        arguments: [12]
    },{
        method: DocMethods.FILLCOLOR,
        arguments: ['black']
    },{
        method: DocMethods.TEXT,
        arguments: ['Level two bullet point.', 50 + 25 + 3 + 25 + 25, null, {
            underline: false,
            strike: false,
            oblique: false,
            link: null,
            continued: false
        }]
    },{
        method: DocMethods.MOVEDOWN,
        arguments: [undefined]
    },{
        method: DocMethods.FONT,
        arguments: ['Times-Roman']
    },{
        method: DocMethods.FONTSIZE,
        arguments: [12]
    },{
        method: DocMethods.FILLCOLOR,
        arguments: ['black']
    },{
        method: DocMethods.TEXT,
        arguments: ['\u2022', 50 + 25 + 25, null, {
            width: (72*6.5) - (3 + 50 + 25 + 25),
            continued: false
        }]
    },{
        method: DocMethods.MOVEUP,
        arguments: [undefined]
    },{
        method: DocMethods.FONT,
        arguments: ['Times-Roman']
    },{
        method: DocMethods.FONTSIZE,
        arguments: [12]
    },{
        method: DocMethods.FILLCOLOR,
        arguments: ['black']
    },{
        method: DocMethods.TEXT,
        arguments: ['Another level two bullet point.', 50 + 25 + 3 + 25 + 25, null, {
            underline: false,
            strike: false,
            oblique: false,
            link: null,
            continued: false
        }]
    },{
        method: DocMethods.MOVEDOWN,
        arguments: [undefined]
    },{
        method: DocMethods.FONT,
        arguments: ['Times-Roman']
    },{
        method: DocMethods.FONTSIZE,
        arguments: [12]
    },{
        method: DocMethods.FILLCOLOR,
        arguments: ['black']
    },{
        method: DocMethods.TEXT,
        arguments: ['\u2022', 50 + 25 + 25 + 25, null, {
            width: (72*6.5) - (3 + 50 + 25 + 25 + 25),
            continued: false
        }]
    },{
        method: DocMethods.MOVEUP,
        arguments: [undefined]
    },{
        method: DocMethods.FONT,
        arguments: ['Times-Roman']
    },{
        method: DocMethods.FONTSIZE,
        arguments: [12]
    },{
        method: DocMethods.FILLCOLOR,
        arguments: ['black']
    },{
        method: DocMethods.TEXT,
        arguments: ['A level three bullet point.', 50 + 25 + 3 + 25 + 25 + 25, null, {
            underline: false,
            strike: false,
            oblique: false,
            link: null,
            continued: false
        }]
    },{
        method: DocMethods.MOVEDOWN,
        arguments: [undefined]
    },{
        method: DocMethods.FONT,
        arguments: ['Times-Roman']
    },{
        method: DocMethods.FONTSIZE,
        arguments: [12]
    },{
        method: DocMethods.FILLCOLOR,
        arguments: ['black']
    },{
        method: DocMethods.TEXT,
        arguments: ['\u2022', 50 + 25, null, {
            width: (72*6.5) - (3 + 50 + 25),
            continued: false
        }]
    },{
        method: DocMethods.MOVEUP,
        arguments: [undefined]
    },{
        method: DocMethods.FONT,
        arguments: ['Times-Roman']
    },{
        method: DocMethods.FONTSIZE,
        arguments: [12]
    },{
        method: DocMethods.FILLCOLOR,
        arguments: ['black']
    },{
        method: DocMethods.TEXT,
        arguments: ['Back to level one.', 50 + 25 + 3 + 25, null, {
            underline: false,
            strike: false,
            oblique: false,
            link: null,
            continued: false
        }]
    }];
    exporter.generatePdf(fakeDelta);
    expect(mockDoc.docRecord).toEqual(output);

  });


  it('should build an ordered list', () => {

    const fakeDelta: ParsedQuillDelta = {
        setup: {
            hyperlinks: [],
            numberedLists: 0
        },
        paragraphs: [{
            textRuns: [{
                text: 'This is normal text.'
            }]
        },{
            textRuns: [{
                text: 'This is level one, first point.'
            }],
            attributes: {
                list: 'ordered'
            }
        },{
            textRuns: [{
                text: 'This is level one, second point.'
            }],
            attributes: {
                list: 'ordered'
            }
        },{
            textRuns: [{
                text: 'This is level two, first point.'
            }],
            attributes: {
                list: 'ordered',
                indent: 1
            }
        },{
            textRuns: [{
                text: 'This is level two, second point.'
            }],
            attributes: {
                list: 'ordered',
                indent: 1
            }
        },{
            textRuns: [{
                text: 'This is level three, first point.'
            }],
            attributes: {
                list: 'ordered',
                indent: 2
            }
        },{
            textRuns: [{
                text: 'This is level three, second point.'
            }],
            attributes: {
                list: 'ordered',
                indent: 2
            }
        },{
            textRuns: [{
                text: 'This is level two, third point.'
            }],
            attributes: {
                list: 'ordered',
                indent: 1
            }
        },{
            textRuns: [{
                text: 'This is level three, first point (restart).'
            }], 
            attributes: {
                list: 'ordered',
                indent: 2
            }
        },{
            textRuns: [{
                text: 'This is level one, third point'
            }],
            attributes: {
                list: 'ordered'
            }
        },{
            textRuns: [{
                text: 'This is normal text in between ordered lists.'
            }]
        },{
            textRuns: [{
                text: 'This is the start of a new ordered list.'
            }],
            attributes: {
                list: 'ordered',
            }
        },{
            textRuns: [{
                text: 'Level two, one.'
            }],
            attributes: {
                list: 'ordered',
                indent: 1
            }
        }]
    };
    const output: DocRecord[] = [{
        method: DocMethods.MOVEDOWN,
        arguments: [undefined]
    },{
        method: DocMethods.FONT,
        arguments: ['Times-Roman']
    },{
        method: DocMethods.FONTSIZE,
        arguments: [12]
    },{
        method: DocMethods.FILLCOLOR,
        arguments: ['black']
    },{
        method: DocMethods.TEXT,
        arguments: ['This is normal text.', 72, null, {
            underline: false,
            strike: false,
            oblique: false,
            link: null,
            continued: false
        }]
    },{
        method: DocMethods.MOVEDOWN,
        arguments: [undefined]
    },{
        method: DocMethods.FONT,
        arguments: ['Times-Roman']
    },{
        method: DocMethods.FONTSIZE,
        arguments: [12]
    },{
        method: DocMethods.FILLCOLOR,
        arguments: ['black']
    },{
        method: DocMethods.TEXT,
        arguments: ['1.', 50 + 25, null, {
            width: (72*6.5) - (3 + 50 + (25 * 1)),
            continued: false
        }]
    },{
        method: DocMethods.MOVEUP,
        arguments: [undefined]
    },{
        method: DocMethods.FONT,
        arguments: ['Times-Roman']
    },{
        method: DocMethods.FONTSIZE,
        arguments: [12]
    },{
        method: DocMethods.FILLCOLOR,
        arguments: ['black']
    },{
        method: DocMethods.TEXT,
        arguments: ['This is level one, first point.', 50 + 25 + 3 + 25, null, {
            underline: false,
            strike: false,
            oblique: false,
            link: null,
            continued: false
        }]
    },{
        method: DocMethods.MOVEDOWN,
        arguments: [undefined]
    },{
        method: DocMethods.FONT,
        arguments: ['Times-Roman']
    },{
        method: DocMethods.FONTSIZE,
        arguments: [12]
    },{
        method: DocMethods.FILLCOLOR,
        arguments: ['black']
    },{
        method: DocMethods.TEXT,
        arguments: ['2.', 50 + 25, null, {
            width: (72*6.5) - (3 + 50 + (25 * 1)),
            continued: false
        }]
    },{
        method: DocMethods.MOVEUP,
        arguments: [undefined]
    },{
        method: DocMethods.FONT,
        arguments: ['Times-Roman']
    },{
        method: DocMethods.FONTSIZE,
        arguments: [12]
    },{
        method: DocMethods.FILLCOLOR,
        arguments: ['black']
    },{
        method: DocMethods.TEXT,
        arguments: ['This is level one, second point.', 50 + 25 + 3 + 25, null, {
            underline: false,
            strike: false,
            oblique: false,
            link: null,
            continued: false
        }]
    },{
        method: DocMethods.MOVEDOWN,
        arguments: [undefined]
    },{
        method: DocMethods.FONT,
        arguments: ['Times-Roman']
    },{
        method: DocMethods.FONTSIZE,
        arguments: [12]
    },{
        method: DocMethods.FILLCOLOR,
        arguments: ['black']
    },{
        method: DocMethods.TEXT,
        arguments: ['a.', 50 + 25 * 2, null, {
            width: (72*6.5) - (3 + 50 + (25 * 2)),
            continued: false
        }]
    },{
        method: DocMethods.MOVEUP,
        arguments: [undefined]
    },{
        method: DocMethods.FONT,
        arguments: ['Times-Roman']
    },{
        method: DocMethods.FONTSIZE,
        arguments: [12]
    },{
        method: DocMethods.FILLCOLOR,
        arguments: ['black']
    },{
        method: DocMethods.TEXT,
        arguments: ['This is level two, first point.', 50 + 25 + 3 + 25 * 2, null, {
            underline: false,
            strike: false,
            oblique: false,
            link: null,
            continued: false
        }]
    },{
        method: DocMethods.MOVEDOWN,
        arguments: [undefined]
    },{
        method: DocMethods.FONT,
        arguments: ['Times-Roman']
    },{
        method: DocMethods.FONTSIZE,
        arguments: [12]
    },{
        method: DocMethods.FILLCOLOR,
        arguments: ['black']
    },{
        method: DocMethods.TEXT,
        arguments: ['b.', 50 + 25 * 2, null, {
            width: (72*6.5) - (3 + 50 + (25 * 2)),
            continued: false
        }]
    },{
        method: DocMethods.MOVEUP,
        arguments: [undefined]
    },{
        method: DocMethods.FONT,
        arguments: ['Times-Roman']
    },{
        method: DocMethods.FONTSIZE,
        arguments: [12]
    },{
        method: DocMethods.FILLCOLOR,
        arguments: ['black']
    },{
        method: DocMethods.TEXT,
        arguments: ['This is level two, second point.', 50 + 25 + 3 + 25 * 2, null, {
            underline: false,
            strike: false,
            oblique: false,
            link: null,
            continued: false
        }]
    },{
        method: DocMethods.MOVEDOWN,
        arguments: [undefined]
    },{
        method: DocMethods.FONT,
        arguments: ['Times-Roman']
    },{
        method: DocMethods.FONTSIZE,
        arguments: [12]
    },{
        method: DocMethods.FILLCOLOR,
        arguments: ['black']
    },{
        method: DocMethods.TEXT,
        arguments: ['i.', 50 + 25 * 3, null, {
            width: (72*6.5) - (3 + 50 + (25 * 3)),
            continued: false
        }]
    },{
        method: DocMethods.MOVEUP,
        arguments: [undefined]
    },{
        method: DocMethods.FONT,
        arguments: ['Times-Roman']
    },{
        method: DocMethods.FONTSIZE,
        arguments: [12]
    },{
        method: DocMethods.FILLCOLOR,
        arguments: ['black']
    },{
        method: DocMethods.TEXT,
        arguments: ['This is level three, first point.', 50 + 25 + 3 + 25 * 3, null, {
            underline: false,
            strike: false,
            oblique: false,
            link: null,
            continued: false
        }]
    },{
        method: DocMethods.MOVEDOWN,
        arguments: [undefined]
    },{
        method: DocMethods.FONT,
        arguments: ['Times-Roman']
    },{
        method: DocMethods.FONTSIZE,
        arguments: [12]
    },{
        method: DocMethods.FILLCOLOR,
        arguments: ['black']
    },{
        method: DocMethods.TEXT,
        arguments: ['ii.', 50 + 25 * 3, null, {
            width: (72*6.5) - (3 + 50 + (25 * 3)),
            continued: false
        }]
    },{
        method: DocMethods.MOVEUP,
        arguments: [undefined]
    },{
        method: DocMethods.FONT,
        arguments: ['Times-Roman']
    },{
        method: DocMethods.FONTSIZE,
        arguments: [12]
    },{
        method: DocMethods.FILLCOLOR,
        arguments: ['black']
    },{
        method: DocMethods.TEXT,
        arguments: ['This is level three, second point.', 50 + 25 + 3 + 25 * 3, null, {
            underline: false,
            strike: false,
            oblique: false,
            link: null,
            continued: false
        }]
    },{
        method: DocMethods.MOVEDOWN,
        arguments: [undefined]
    },{
        method: DocMethods.FONT,
        arguments: ['Times-Roman']
    },{
        method: DocMethods.FONTSIZE,
        arguments: [12]
    },{
        method: DocMethods.FILLCOLOR,
        arguments: ['black']
    },{
        method: DocMethods.TEXT,
        arguments: ['c.', 50 + 25 * 2, null, {
            width: (72*6.5) - (3 + 50 + (25 * 2)),
            continued: false
        }]
    },{
        method: DocMethods.MOVEUP,
        arguments: [undefined]
    },{
        method: DocMethods.FONT,
        arguments: ['Times-Roman']
    },{
        method: DocMethods.FONTSIZE,
        arguments: [12]
    },{
        method: DocMethods.FILLCOLOR,
        arguments: ['black']
    },{
        method: DocMethods.TEXT,
        arguments: ['This is level two, third point.', 50 + 25 + 3 + 25 * 2, null, {
            underline: false,
            strike: false,
            oblique: false,
            link: null,
            continued: false
        }]
    },{
        method: DocMethods.MOVEDOWN,
        arguments: [undefined]
    },{
        method: DocMethods.FONT,
        arguments: ['Times-Roman']
    },{
        method: DocMethods.FONTSIZE,
        arguments: [12]
    },{
        method: DocMethods.FILLCOLOR,
        arguments: ['black']
    },{
        method: DocMethods.TEXT,
        arguments: ['i.', 50 + 25 * 3, null, {
            width: (72*6.5) - (3 + 50 + (25 * 3)),
            continued: false
        }]
    },{
        method: DocMethods.MOVEUP,
        arguments: [undefined]
    },{
        method: DocMethods.FONT,
        arguments: ['Times-Roman']
    },{
        method: DocMethods.FONTSIZE,
        arguments: [12]
    },{
        method: DocMethods.FILLCOLOR,
        arguments: ['black']
    },{
        method: DocMethods.TEXT,
        arguments: ['This is level three, first point (restart).', 50 + 25 + 3 + 25 * 3, null, {
            underline: false,
            strike: false,
            oblique: false,
            link: null,
            continued: false
        }]
    },{
        method: DocMethods.MOVEDOWN,
        arguments: [undefined]
    },{
        method: DocMethods.FONT,
        arguments: ['Times-Roman']
    },{
        method: DocMethods.FONTSIZE,
        arguments: [12]
    },{
        method: DocMethods.FILLCOLOR,
        arguments: ['black']
    },{
        method: DocMethods.TEXT,
        arguments: ['3.', 50 + 25 * 1, null, {
            width: (72*6.5) - (3 + 50 + (25 * 1)),
            continued: false
        }]
    },{
        method: DocMethods.MOVEUP,
        arguments: [undefined]
    },{
        method: DocMethods.FONT,
        arguments: ['Times-Roman']
    },{
        method: DocMethods.FONTSIZE,
        arguments: [12]
    },{
        method: DocMethods.FILLCOLOR,
        arguments: ['black']
    },{
        method: DocMethods.TEXT,
        arguments: ['This is level one, third point', 50 + 25 + 3 + 25 * 1, null, {
            underline: false,
            strike: false,
            oblique: false,
            link: null,
            continued: false
        }]
    },{
        method: DocMethods.MOVEDOWN,
        arguments: [undefined]
    },{
        method: DocMethods.FONT,
        arguments: ['Times-Roman']
    },{
        method: DocMethods.FONTSIZE,
        arguments: [12]
    },{
        method: DocMethods.FILLCOLOR,
        arguments: ['black']
    },{
        method: DocMethods.TEXT,
        arguments: ['This is normal text in between ordered lists.', 72, null, {
            underline: false,
            strike: false,
            oblique: false,
            link: null,
            continued: false
        }]
    },{
        method: DocMethods.MOVEDOWN,
        arguments: [undefined]
    },{
        method: DocMethods.FONT,
        arguments: ['Times-Roman']
    },{
        method: DocMethods.FONTSIZE,
        arguments: [12]
    },{
        method: DocMethods.FILLCOLOR,
        arguments: ['black']
    },{
        method: DocMethods.TEXT,
        arguments: ['1.', 50 + 25 * 1, null, {
            width: (72*6.5) - (3 + 50 + (25 * 1)),
            continued: false
        }]
    },{
        method: DocMethods.MOVEUP,
        arguments: [undefined]
    },{
        method: DocMethods.FONT,
        arguments: ['Times-Roman']
    },{
        method: DocMethods.FONTSIZE,
        arguments: [12]
    },{
        method: DocMethods.FILLCOLOR,
        arguments: ['black']
    },{
        method: DocMethods.TEXT,
        arguments: ['This is the start of a new ordered list.', 50 + 25 + 3 + 25 * 1, null, {
            underline: false,
            strike: false,
            oblique: false,
            link: null,
            continued: false
        }]
    },{
        method: DocMethods.MOVEDOWN,
        arguments: [undefined]
    },{
        method: DocMethods.FONT,
        arguments: ['Times-Roman']
    },{
        method: DocMethods.FONTSIZE,
        arguments: [12]
    },{
        method: DocMethods.FILLCOLOR,
        arguments: ['black']
    },{
        method: DocMethods.TEXT,
        arguments: ['a.', 50 + 25 * 2, null, {
            width: (72*6.5) - (3 + 50 + (25 * 2)),
            continued: false
        }]
    },{
        method: DocMethods.MOVEUP,
        arguments: [undefined]
    },{
        method: DocMethods.FONT,
        arguments: ['Times-Roman']
    },{
        method: DocMethods.FONTSIZE,
        arguments: [12]
    },{
        method: DocMethods.FILLCOLOR,
        arguments: ['black']
    },{
        method: DocMethods.TEXT,
        arguments: ['Level two, one.', 50 + 25 + 3 + 25 * 2, null, {
            underline: false,
            strike: false,
            oblique: false,
            link: null,
            continued: false
        }]
    }];
    exporter.generatePdf(fakeDelta);
    expect(mockDoc.docRecord).toEqual(output);

  });


  it('should modify font size', () => {

    const fakeDelta: ParsedQuillDelta = {
        setup: {
            hyperlinks: [],
            numberedLists: 0
        },
        paragraphs: [{
            textRuns: [{
                text: 'This is large font here.',
                attributes: {
                    size: 'large'
                }
            },{
                text: 'Followed by small text.',
                attributes: {
                    size: 'small'
                }
            },{
                text: 'Followed by huge text.',
                attributes: {
                    size: 'huge'
                }
            }]
        }]
    };
    const output: DocRecord[] = [{
        method: DocMethods.MOVEDOWN,
        arguments: [undefined]
    },{
        method: DocMethods.FONT,
        arguments: ['Times-Roman']
    },{
        method: DocMethods.FONTSIZE,
        arguments: [12]
    },{
        method: DocMethods.FONTSIZE,
        arguments: [16]
    },{
        method: DocMethods.FILLCOLOR,
        arguments: ['black']
    },{
        method: DocMethods.TEXT,
        arguments: ['This is large font here.', 72, null, {
            underline: false,
            strike: false,
            oblique: false,
            link: null,
            continued: true
        }]
    },{
        method: DocMethods.FONT,
        arguments: ['Times-Roman']
    },{
        method: DocMethods.FONTSIZE,
        arguments: [12]
    },{
        method: DocMethods.FONTSIZE,
        arguments: [8]
    },{
        method: DocMethods.FILLCOLOR,
        arguments: ['black']
    },{
        method: DocMethods.TEXT,
        arguments: ['Followed by small text.', 72, null, {
            underline: false,
            strike: false,
            oblique: false,
            link: null,
            continued: true
        }]
    },{
        method: DocMethods.FONT,
        arguments: ['Times-Roman']
    },{
        method: DocMethods.FONTSIZE,
        arguments: [12]
    },{
        method: DocMethods.FONTSIZE,
        arguments: [18]
    },{
        method: DocMethods.FILLCOLOR,
        arguments: ['black']
    },{
        method: DocMethods.TEXT,
        arguments: ['Followed by huge text.', 72, null, {
            underline: false,
            strike: false,
            oblique: false,
            link: null,
            continued: false
        }]
    }];
    exporter.generatePdf(fakeDelta);
    expect(mockDoc.docRecord).toEqual(output);

  });


  it('should use custom styles', () => {

    const config: Config = {
        styles: {
            header_1: {
                font: 'Times-Roman',
                fontSize: 24,
                levelIndent: 25, 
                baseIndent: 72
            }
        }
    };
    const fakeDelta: ParsedQuillDelta = {
        setup: {
            hyperlinks: [],
            numberedLists: 0
        },
        paragraphs: [{
            textRuns: [{
                text: 'Some basic text here.'
            }]
        },{
            textRuns: [{
                text: 'This is a Custom Heading'
            }],
            attributes: {
                header: 1
            }
        }]
    };
    const output: DocRecord[] = [{
        method: DocMethods.MOVEDOWN,
        arguments: [undefined]
    },{
        method: DocMethods.FONT,
        arguments: ['Times-Roman']
    },{
        method: DocMethods.FONTSIZE,
        arguments: [12]
    },{
        method: DocMethods.FILLCOLOR,
        arguments: ['black']
    },{
        method: DocMethods.TEXT,
        arguments: ['Some basic text here.', 72, null, {
            underline: false,
            strike: false,
            oblique: false,
            link: null,
            continued: false
        }]
    },{
        method: DocMethods.MOVEDOWN,
        arguments: [undefined]
    },{
        method: DocMethods.FONT,
        arguments: ['Times-Roman']
    },{
        method: DocMethods.FONTSIZE,
        arguments: [24]
    },{
        method: DocMethods.FILLCOLOR,
        arguments: ['black']
    },{
        method: DocMethods.TEXT,
        arguments: ['This is a Custom Heading', 72, null, {
            underline: false,
            strike: false,
            oblique: false,
            link: null,
            continued: false
        }]
    }];
    exporter.generatePdf(fakeDelta, config);
    expect(mockDoc.docRecord).toEqual(output);
  });


});
