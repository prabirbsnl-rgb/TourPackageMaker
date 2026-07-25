
import { generateQuotationPdf } from "../../pdf/generateQuotationPdf";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useRef } from "react";

import orbitzLogo from "../../assets/orbitz-logo.png";
import webIcon from "../../assets/web.png";
import phoneIcon from "../../assets/phone.png";
import locationIcon from "../../assets/location.png";

import {
  Document,
  Packer,
  Paragraph,
  HeadingLevel,
  ImageRun,
  AlignmentType,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  TableLayoutType
} from "docx";


import { saveAs } from "file-saver";

export default function QuotePreview(props) {

  console.log("QuotePreview props =", props);

  const {
    commonData,
    packageData,
    itineraryData
  } = props;

  if (!commonData) {
    return <div>commonData is undefined</div>;
  }

  const quoteData = {
    ...commonData,
    ...packageData,
    ...itineraryData
  };
  
  const quoteRef = useRef();
  

 const downloadPDF_old = async () => {
 
    
    const canvas = await html2canvas(
  quoteRef.current,
  {
    scale: 3,
    useCORS: true,
    backgroundColor: "#ffffff"
  }
);

 const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");

const pdfWidth =
  pdf.internal.pageSize.getWidth();

const pdfHeight =
  pdf.internal.pageSize.getHeight();

const imgWidth = pdfWidth;

const imgHeight =
  (canvas.height * imgWidth) /
  canvas.width;

let heightLeft = imgHeight;

let position = 0;

pdf.addImage(
  imgData,
  "PNG",
  0,
  position,
  imgWidth,
  imgHeight
);

heightLeft -= pdfHeight;

while (heightLeft > 0) {

  position -= pdfHeight;

  pdf.addPage();

  pdf.addImage(
    imgData,
    "PNG",
    0,
    position,
    imgWidth,
    imgHeight
  );

  heightLeft -= pdfHeight;
}

pdf.save("quotation.pdf");
 
};

 const downloadPDF = async () => {

  await generateQuotationPdf({

    ...quoteData,

    applyGst: commonData.applyGst,

    gstPercent: commonData.gstPercent,

    subtotal,

    gstAmount,

    grandTotal,

    grandTotalUsd,

  });

};
 
const downloadWord = async () => {

const response = await fetch(orbitzLogo);
const imageBuffer = await response.arrayBuffer();

const webBuffer = await (
  await fetch(webIcon)
).arrayBuffer();

const phoneBuffer = await (
  await fetch(phoneIcon)
).arrayBuffer();

const locationBuffer = await (
  await fetch(locationIcon)
).arrayBuffer();


const noBorder = {
  top: { style: BorderStyle.NONE },
  bottom: { style: BorderStyle.NONE },
  left: { style: BorderStyle.NONE },
  right: { style: BorderStyle.NONE },
};

const WORD_LAYOUT = {
  ribbonLeftPadding: 6,   // space before ribbon title
  bodyIndent: 6,          // common left indent for body content
};

const cell = (
  text,
  width,
  bold = false,
  align = AlignmentType.LEFT,
  leftMargin = 0,
  fontSize = 20,
  fontName = "Times New Roman"
) =>
  new TableCell({
    width: {
      size: width,
      type: WidthType.PERCENTAGE,
    },
    borders: noBorder,

    margins: {
  top: 70,
  bottom: 70,
  left: leftMargin,
  right: 20,
},

    children: [
      new Paragraph({
  alignment: align,
  wordWrap: false,
  children: [
          new TextRun({
  text: String(text ?? ""),
  bold,
  font: fontName,
  size: fontSize,
}),
        ],
      }),
    ],
  });

  
  const wordSummaryRow = (
  l1, v1,
  l2, v2,
  l3, v3
) =>
  new TableRow({
    children: [

      cell(
  l1,
  12,
  true,
  AlignmentType.LEFT,
  100,
  21,                 // font size
  "Times New Roman"   // font
),

cell(":", 2),
cell(
  v1,
  19,
  false,
  AlignmentType.LEFT,
  0,
  21,                 // slightly smaller
  "Times New Roman"
),

cell(
  l2,
  12,
  true,
  AlignmentType.LEFT,
  100,
   21,                 // font size
  "Times New Roman"   // font
),

cell(":", 2),
cell(
  v2,
  19,
  false,
  AlignmentType.LEFT,
  0,
  21,                 // slightly smaller
  "Times New Roman"
),

cell(
  l3,
  14,
  true,
  AlignmentType.LEFT,
  100,
  21,                 // font size
  "Times New Roman"   // font
),
cell(l3 ? ":" : "", 2),
cell(
  v3,
  18,
  false,
  AlignmentType.LEFT,
  0,
  21,                 // slightly smaller
  "Times New Roman"
),
    ],
  });

const greyCostRow = (label, value) =>

new TableRow({

  children: [

  // Label
  new TableCell({
    width:{
      size:55,
      type:WidthType.PERCENTAGE,
    },
    shading:{fill:"EEF1F4"},
    borders:noBorder,
    margins:{
      top:70,
      bottom:120,
      left:180,
    },
    children: [
  new Paragraph({
    children: [
      new TextRun({
        text: label,
        bold: true,
        color: "000000",
        font: "Times New Roman",
        size: 21,
      }),
    ],
  }),
]
  }),

  // Colon
  new TableCell({
    width:{
      size:5,
      type:WidthType.PERCENTAGE,
    },
    shading:{fill:"EEF1F4"},
    borders:noBorder,
    margins:{
      top:70,
      bottom:70,
    },
    children:[
      new Paragraph(":")
    ]
  }),

  // Value
  new TableCell({
    width:{
      size:40,
      type:WidthType.PERCENTAGE,
    },
    shading:{fill:"EEF1F4"},
    borders:noBorder,
    margins:{
      top:70,
      bottom:120,
      left:40,
    },
    children:[
      new Paragraph({
        children:[
          new TextRun({
  text: value,
  bold: true,
  color: "000000",
  font: "Times New Roman",
  size: 21,
})
        ]
      })
    ]
  }),

]

});

const blueCostRow=(label,value)=>

new TableRow({

children: [

 // Label
new TableCell({
  width:{
    size:55,
    type:WidthType.PERCENTAGE,
  },
  shading:{fill:"DCEEFF"},
  borders:noBorder,
  margins:{
    top:70,
    bottom:120,
    left:180,
  },
  children:[
    new Paragraph({
      children:[
        new TextRun({
          text: label,
          bold: true,
          size: 20,
          color: "1E3A8A",
        })
      ]
    })
  ]
}),

  // Colon
  new TableCell({
    width:{
      size:5,
      type:WidthType.PERCENTAGE,
    },
    shading:{fill:"DCEEFF"},
    borders:noBorder,
    margins:{
      top:70,
      bottom:70,
    },
    children:[
      new Paragraph(":")
    ]
  }),

  // Value
  new TableCell({
    width:{
      size:40,
      type:WidthType.PERCENTAGE,
    },
    shading:{fill:"DCEEFF"},
    borders:noBorder,
    margins:{
      top:70,
      bottom:120,
      left:40,
    },
    children:[
      new Paragraph({
        children:[
          new TextRun({
  text: value,
  bold: true,
  size: 20,
  color: "1E3A8A",
})
        ]
      })
    ]
  }),

]
});
  
  
  const sectionHeaderTable = (title) =>

  new Table({

    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },

    layout: TableLayoutType.FIXED,

    borders: noBorder,

    rows: [

      new TableRow({

        children: [

          new TableCell({

            borders: noBorder,

            shading: {
              fill: "E1DAF0",
            },

            margins: {
              top: 50,
              bottom: 50,
              left: 140,
              right: 40,
            },

            children: [

              new Paragraph({

                children: [

                  new TextRun({

                    text: title,

                    bold: true,

                    font: "Times New Roman",

                    size: 22,

                    color: "000000",

                  }),

                ],

              }),

            ],

          }),

        ],

      }),

    ],

  });

  
const bulletListInline = (items) =>
  new Paragraph({

    indent: {
      left: 170,          // aligns with ribbon/body
    },

    spacing: {
      before: 0,
      after: 120,
    },

    children: items.flatMap((item, index) => [

      new TextRun({
  text: item,
  font: "Times New Roman",
  size: 21,
  bold: false,
  color: "000000",
}),

      ...(index < items.length - 1
        ? [
            new TextRun({
  text: "   •   ",
  bold: true,
  font: "Times New Roman",
  size: 21,
  color: "000000",
}),
          ]
        : []),

    ]),

  });

const costRows = [];

// ---------- Vehicle Costing ----------
if (
  quoteData.useVehicleCosting &&
  quoteData.vehicleCosts?.length > 0
) {

  quoteData.vehicleCosts.forEach(vehicle => {

      const cost = Number(vehicle.cost || 0);

  const gst =
    commonData?.applyGst
      ? cost * Number(commonData.gstPercent) / 100
      : 0;

  const total = cost + gst;

  // Package Cost
  costRows.push(

    greyCostRow(
      `Package Cost With (${vehicle.vehicle})`,
      `₹${cost.toLocaleString()}`
    )

  );

  // GST
  if (commonData?.applyGst) {

    costRows.push(

      greyCostRow(
        `GST (${commonData.gstPercent}%)`,
        `₹${gst.toLocaleString()}`
      )

    );

  }

  // Grand Total
  costRows.push(

    blueCostRow(
      "GRAND TOTAL",
      `₹${total.toLocaleString()}`
    )

  );

});

}

// ---------- General Package ----------

else {

  costRows.push(

    greyCostRow(
      "Package Cost",
      `₹${subtotal.toLocaleString()}`
    )

  );

  if (commonData?.applyGst) {

    costRows.push(

      greyCostRow(
        `GST (${commonData.gstPercent}%)`,
        `₹${gstAmount.toLocaleString()}`
      )

    );

  }

  costRows.push(

    blueCostRow(
      "GRAND TOTAL",
      `₹${grandTotal.toLocaleString()}`
    )

  );

}

if (
  quoteData.showUsd &&
  !quoteData.useVehicleCosting
) {

  costRows.push(

    greyCostRow(
      "USD Equivalent",
      `$${grandTotalUsd.toFixed(2)}`
    )

  );

}


console.log(imageBuffer.byteLength);



  const infoRow = (
  leftLabel,
  leftValue,
  rightLabel,
  rightValue
) =>
  new TableRow({
    children: [
      cell(leftLabel, 17, true),
cell(":", 2),
cell(leftValue, 29),

cell(rightLabel, 19, true),
cell(rightLabel ? ":" : "", 2),
cell(rightLabel ? rightValue : "", 31),
    ],
  });

const itineraryRow = (label, value) =>
  new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },

    borders: {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.NONE },
      insideVertical: { style: BorderStyle.NONE },
    },

    rows: [
      new TableRow({
        children: [

          new TableCell({
            width: {
              size: 16,
              type: WidthType.PERCENTAGE,
            },
            borders: noBorder,
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: label,
                    bold: true,
                    size: 22,
                  }),
                ],
              }),
            ],
          }),

          new TableCell({
            width: {
              size: 84,
              type: WidthType.PERCENTAGE,
            },
            borders: noBorder,
            children: [
              new Paragraph({
      children: value,
    }),
  ],
}),
            ],
          }),

        ],
       });

       
const inlineRibbon = (text, dark = false) =>
  new TextRun({
    text: ` ${text} `,
    bold: true,
    shading: {
      fill: dark ? "9CA3AF" : "C7CBD1",
    },
    color: "111111",
    size: 24,
  });

  
 const travelStart = new Date(quoteData.travelFrom);

  
const doc = new Document({
  sections: [
    {
      properties: {
        page: {
          margin: {
            top: 550,
            bottom: 550,
            left: 360,
            right: 360,
          },
        },
      },

      children: [
          new Table({
  width: {
    size: 100,
    type: WidthType.PERCENTAGE,
  },
  borders: {
  top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
},

  rows: [

    new TableRow({

      children: [

        // ---------- LEFT CELL ----------
new TableCell({

  width: {
  size: 56,
  type: WidthType.PERCENTAGE,
},
  borders: {
    top: { style: BorderStyle.NONE },
    bottom: { style: BorderStyle.NONE },
    left: { style: BorderStyle.NONE },
    right: { style: BorderStyle.NONE },
  },

  children: [

    // Logo
    new Paragraph({
      alignment: AlignmentType.CENTER,

      children: [
        new ImageRun({
          data: imageBuffer,
          type: "png",
          transformation: {
            width: 250,
            height: 70,
          },
        }),
      ],
    }),

    // Slogan
    new Paragraph({

      alignment: AlignmentType.CENTER,

      spacing: {
        before: 5,
      },

      children: [
        new TextRun({
          text: "Anywhere, Anytime, Around the World",
          italics: true,
          size: 22,
          color: "000000",
          font: "Monotype Corsiva",
        }),
      ],
    }),

    // Services
    new Paragraph({

      alignment: AlignmentType.CENTER,

      spacing: {
        before: 16,
      },

      children: [
        new TextRun({
          text:
            "Domestic & International Tours | Visa Assistance | Holidays",
          bold: true,
          size: 20,
        }),
      ],
    }),

  ],

}),

        // ---------- RIGHT CELL ----------
        new TableCell({

          width: {
  size: 44,
  type: WidthType.PERCENTAGE,
},
          

          borders: {
            top: { style: BorderStyle.NONE },
            bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
          },

          children: [
            new Paragraph({
    children: [
      new TextRun({
        text: "",
      }),
    ],

    spacing: {
      after: 140,
    },
  }),

            new Paragraph({
 
              alignment: AlignmentType.LEFT,

              children: [

                new ImageRun({
                  data: webBuffer,
                  type: "png",
                  transformation: {
                    width: 16,
                    height: 16,
                  },
                }),

                new TextRun({
                  text: "  www.orbitzholidays.com",
                  color: "000000",
                }),
                new TextRun({
    text: "",
    break: 1,
}),
                new Paragraph({

  spacing: {
    before: 60,
  },

  alignment: AlignmentType.LEFT,

  children: [

    new ImageRun({
      data: phoneBuffer,
      type: "png",
      transformation: {
        width: 16,
        height: 16,
      },
    }),

    new TextRun({
      text: "  +91 9330844031 | +91 9830489892",
      color: "000000",
    }),

  ],

}),
new Paragraph({

  spacing: {
    before: 60,
  },

  alignment: AlignmentType.LEFT,

  children: [

    new ImageRun({
      data: locationBuffer,
      type: "png",
      transformation: {
        width: 16,
        height: 16,
      },
    }),

    new TextRun({
      text:
        "  B-7/37(s), Central Park, Kalyani,\n  West Bengal-741235",
        color: "000000",
    }),

  ],

}),

],

            }),

          ],

        }),

      ],

    }),

  ],

}),


        
    



  
new Paragraph({
  border: {
    bottom: {
      style: BorderStyle.SINGLE,
      size: 8,
      color: "2563EB",
    },
  },
  spacing: {
    after: 120,
  },
}),

  new Paragraph(""),

 sectionHeaderTable("TOUR SUMMARY"),

new Paragraph({
  spacing: {
    before: 0,
    after: 0,
  },
}),

new Table({

  width: {
    size: 100,
    type: WidthType.PERCENTAGE,
  },

layout: TableLayoutType.FIXED,

  borders: {
    top: { style: BorderStyle.NONE },
    bottom: { style: BorderStyle.NONE },
    left: { style: BorderStyle.NONE },
    right: { style: BorderStyle.NONE },
    insideHorizontal: { style: BorderStyle.NONE },
    insideVertical: { style: BorderStyle.NONE },
  },

  rows: [

    wordSummaryRow(
      "Client Name",
      quoteData.clientName || "",
      "Mobile",
      quoteData.mobile || "",
      "Email",
      quoteData.email || ""
    ),

    wordSummaryRow(
      "Destination",
      quoteData.customDestination?.trim()
  ? quoteData.customDestination
  : quoteData.destination || "",
      "Travel Dates",
      `${formatShortDate(quoteData.travelFrom)} - ${formatShortDate(quoteData.travelTo)}`,
      "Duration",
      quoteData.quoteMode === "package"
        ? `${quoteData.totalDays} Days / ${quoteData.totalNights} Nights`
        : `${calculatedDays} Days / ${calculatedNights} Nights`
    ),

    wordSummaryRow(
      "Adults",
      quoteData.adults || 0,
      "Children",
      quoteData.children || 0,
      "Accomm.",
      quoteData.accommodation || "-"
    ),

   wordSummaryRow(
      "Quotation No",
      shortQuotationNo(quoteData.quotationNo) || "",
      "Date",
      formatDate(new Date()),
      "",
      ""
    ),

  ],

}),
          
  new Paragraph(" "),

sectionHeaderTable("INCLUSIONS"),

new Paragraph({
  spacing: {
    before: 0,
    after: 0,
  },
}),

bulletListInline([
  ...(quoteData.inclusions || []),
  ...(quoteData.customInclusions || [])
]),

sectionHeaderTable("EXCLUSIONS"),
new Paragraph({
  spacing: {
    before: 0,
    after: 0,
  },
}),
bulletListInline([
  ...(quoteData.exclusions || []),
  ...(quoteData.customExclusions || [])
]),
sectionHeaderTable("SIGHTSEEING INCLUDED"),
new Paragraph({
  spacing: {
    before: 0,
    after: 0,
  },
}),
bulletListInline([
  ...(quoteData.sightseeing || []),
  ...(quoteData.customSightseeing || [])
]),

sectionHeaderTable("TRANSFERS INCLUDED"),
new Paragraph({
  spacing: {
    before: 0,
    after: 0,
  },
}),
bulletListInline([
  ...(quoteData.transfers || []),
  ...(quoteData.customTransfers || [])
]),

sectionHeaderTable("MEALS INCLUDED"),
new Paragraph({
  spacing: {
    before: 0,
    after: 0,
  },
}),
bulletListInline([
  ...(quoteData.meals|| []),
  ...(quoteData.customMeals|| [])
]),

                 


...(quoteData.quoteMode === "itinerary"
  ? [
      sectionHeaderTable("DAY WISE ITINERARY"),
      new Paragraph({
  spacing: {
    before: 0,
    after: 0,
  },
}),

      ...(quoteData.itinerary || []).flatMap((day, index) => {
          const cityName =
    day.customCity?.trim()
      ? day.customCity
      : day.city;

 const itineraryDate = new Date(travelStart);
 

          itineraryDate.setDate(
  travelStart.getDate() + index
);
const estimatedLines =
  (day.sightseeing?.length || 0) +
  (day.customSightseeing?.length || 0) +

  (day.transfers?.length || 0) +
  (day.customTransfers?.length || 0) +
  
  (
  (day.meals?.length || 0) +
  (day.customMeals?.length || 0)
) > 0
  Math.ceil((day.description?.length || 0) / 120);
      return [

          new Paragraph({
  keepNext: true,
  keepLines: true,

  spacing: {
    before: 180,
    after: 140,
  },

  children: [
    inlineRibbon(
      `DAY ${day.day}  —  ${formatDate(itineraryDate)}`
    ),

    new TextRun({
      text: "   ",
    }),

    inlineRibbon(day.title || ""),
  ],
}),

...(day.description?.trim()
  ? [
      new Paragraph({
         keepNext: true,
         keepLines: true,
        spacing: {
          before: 140,
          after: 220,
          line: 320, // slightly more comfortable line spacing
        },

        alignment: AlignmentType.JUSTIFIED,

        indent: {
          left: 180,
          right: 120,
        },

        children: [
          new TextRun({
            text: day.description,
            italics: true,
            color: "000000",
            size: 22,
          }),
        ],
      }),
    ]
  : []),



...(cityName || day.hotel || day.customHotel || (
  (day.meals?.length || 0) +
  (day.customMeals?.length || 0)
)
  ? [
    new Paragraph({
  keepNext: true,
  keepLines: true,
}),
      itineraryRow("City:", [

        new TextRun({
          text: cityName || "-",
          size: 22,
        }),

        new TextRun({
          text: "   ◆   ",
          size: 18,
          color: "000000",
        }),

        new TextRun({
          text: "Hotel: ",
          bold: true,
          size: 22,
        }),

        new TextRun({
          text: day.customHotel || day.hotel || "-",
          size: 22,
        }),

        ...(day.hotelCategoryLabel
          ? [
              new TextRun({
                text: ` (${day.hotelCategoryLabel})`,
                italics: true,
                color: "666666",
                size: 20,
              }),
            ]
          : []),

        new TextRun({
          text: "   ◆   ",
          size: 18,
          color: "000000",
        }),

        new TextRun({
          text: "Meals: ",
          bold: true,
          size: 22,
        }),

        new TextRun({
  text:
    [
      ...(day.meals || []),
      ...(day.customMeals || [])
    ].length
      ? [
          ...(day.meals || []),
          ...(day.customMeals || [])
        ].join(" • ")
      : "-",
  size: 22,
}),

      ]),
    ]
  : []),

          ...(day.sightseeing?.length || (day.customSightseeing || [])
  ? [
    new Paragraph({
        keepNext: true,
        keepLines: true,
      }),

      itineraryRow("Sightseeing:", [
        new TextRun({
          text: [
  ...(day.sightseeing || []),
  ...(day.customSightseeing || [])
].join(" • "),
          size: 22,
        }),
      ]),
    ]
  : []),

        ...(
  (
    (day.transfers?.length || 0) +
    (day.customTransfers?.length || 0)
  )
  ? [
    new Paragraph({
        keepNext: true,
        keepLines: true,
      }),

      itineraryRow("Transfers:", [
        new TextRun({
          text: [
  ...(day.transfers || []),
  ...(day.customTransfers || [])
].join(" • "),
          size: 22,
        }),
      ]),
    ]
  : []),

          
          new Paragraph(" ")
            ];
}),
]
: []),
       

        // VISA INFORMATION

      ...(quoteData.visaRequired
  ? [
      sectionHeaderTable(
        "VISA INFORMATION (Visa Assistance Included)"
      ),
      new Paragraph({
  spacing: {
    before: 0,
    after: 0,
  },
}),

      bulletListInline([
        ...(quoteData.visaServices || []),
        ...(quoteData.customVisaServices || []),
      ]),
    ]
  : []),

sectionHeaderTable("COST SUMMARY"),

new Paragraph({
  spacing: {
    before: 0,
    after: 0,
  },
}),
new Table({
  width: {
    size: 65,
    type: WidthType.PERCENTAGE,
  },

  borders: {
    top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  },

  rows: costRows,
}),

...(quoteData.specialNotes?.trim() || quoteData.terms?.length
  ? [

      new Paragraph(" "),

      

      sectionHeaderTable("IMPORTANT NOTES & TERMS"),
      new Paragraph({
  spacing: {
    before: 0,
    after: 0,
  },
}),

      ...(quoteData.specialNotes?.trim()
        ? [
            new Paragraph({

  indent: {
    left: 180,
  },

  spacing: {
    before: 0,
    after: 100,
  },

  children: [

    new TextRun({
      text: "Special Notes : ",
      bold: true,
      font: "Times New Roman",
      size: 21,
color: "000000",
    }),

    new TextRun({
      text:
        quoteData.specialNotes
          .split(",")
          .map(note => note.trim())
          .filter(Boolean)
          .join("   •   "),
      font: "Times New Roman",
      size: 21,
color: "000000",
    }),

  ],

}),
          ]
        : []),

      new Paragraph({

  indent: {
    left: 180,
  },

  spacing: {
    before: 0,
    after: 100,
  },

  children: [

    new TextRun({
      text:
        (quoteData.terms || []).join(" • "),
      font: "Times New Roman",
      size: 20,
color: "000000",
    }),

  ],

}),

    ]
  : []),

  new Paragraph(""),

new Paragraph({
  border: {
    top: {
      style: BorderStyle.SINGLE,
      size: 8,
      color: "2563EB",
    },
  },
  spacing: {
    before: 120,
  },
}),

new Paragraph(""),

new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: {
    before: 180,
    after: 40,
  },
  children: [
    new TextRun({
      text: "✈ Thank You for Choosing Orbitz Holidays ✈",
      bold: true,
      color: "1E3A8A",
      size: 30, // 15 pt
    }),
  ],
}),

new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: {
    after: 120,
  },
  children: [
    new TextRun({
      text: "Anywhere, Anytime, Around the World",
      italics: true,
      color: "000000",
      size: 22, // 11 pt
      font: "Georgia",
    }),
  ],
}),  
],   // <-- children array ends here
    },
  ],
});

  const blob = await Packer.toBlob(doc);

  saveAs(
    blob,
    `${quoteData.destination || "Quotation"}.docx`
  );

};

const previewItineraryRow = (label, value) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "90px 1fr",
      alignItems: "start",
      columnGap: "8px",
      marginBottom: "6px",
      fontSize: "15px",
      lineHeight: "1.7",
    }}
  >
    <div
      style={{
        fontWeight: "700",
        color: "#111827",
        textAlign: "left",
      }}
    >
      {label}
    </div>

    <div
      style={{
        color: "#111827",
        textAlign: "left",
      }}
    >
      {value}
    </div>
  </div>
);

   const packageCost =
commonData?.useVehicleCosting
  ? Number(commonData?.vehiclePackageCost || 0)
  :
(
  (
    Number(commonData?.perAdultCost || 0) *
    Number(commonData?.adults || 0)
  )
  +
  (
    Number(commonData?.perChildCost || 0) *
    Number(commonData?.children || 0)
  )
);

const markupAmount =
  (
    packageCost *
    Number(commonData?.markupPercent || 0)
  ) / 100;

const subtotal =
  packageCost + markupAmount;

const gstAmount =
  commonData?.applyGst
    ? (
        subtotal *
        Number(commonData?.gstPercent || 0)
      ) / 100
    : 0;

const grandTotal =
  subtotal + gstAmount;

  const usdRate =
  Number(quoteData?.usdRate || 86);

const grandTotalUsd =
  grandTotal / usdRate;
  
  const travelFrom = quoteData?.travelFrom
  ? new Date(quoteData.travelFrom)
  : null;

const travelTo = quoteData?.travelTo
  ? new Date(quoteData.travelTo)
  : null;

const calculatedDays =
  travelFrom && travelTo
    ? Math.floor(
        (travelTo - travelFrom) /
        (1000 * 60 * 60 * 24)
      ) + 1
    : 0;

const calculatedNights =
  calculatedDays > 0
    ? calculatedDays - 1
    : 0;

  

  const hotelNightMap = {};

(quoteData.itinerary || []).forEach(
  (day) => {

    const hotelName =
  day.customHotel || day.hotel;

if (!hotelName) return;

if (!hotelNightMap[hotelName]) {
  hotelNightMap[hotelName] = [];
}

hotelNightMap[hotelName].push(
  `Night ${day.day}`
);

 });

const formatDate = (dateString) => {
  if (!dateString) return "";

  const d = new Date(dateString);

  const day = d.getDate();

  const suffix =
    day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
      ? "nd"
      : day % 10 === 3 && day !== 13
      ? "rd"
      : "th";

  const month = d.toLocaleString("en-GB", {
    month: "short",
  });

  const year = d.getFullYear();

  return `${day}${suffix} ${month} ${year}`;
};

const formatShortDate = (date) => {
  if (!date) return "";

  const d = new Date(date);

  const day = d.getDate();

  const month = d.toLocaleString("en-US", {
    month: "short",
  });

  const year = String(d.getFullYear()).slice(-2);

  return `${day} ${month}'${year}`;
};

const shortQuotationNo = (qtn) => {
  if (!qtn) return "";

  const digits = qtn.replace(/\D/g, "");

  return `QTN-${digits.slice(-6)}`;
};



  const sectionHeading = (
  title,
  subtitle = "",
  marginTop = "25px"
) => (
    <div
    style={{
      background: "#C7CBD1",
      color: "#111827",
      fontWeight: "700",
      fontSize: "18px",
      
      letterSpacing: "0.8px",
      padding: "2px 12px",
      lineHeight: "1.1",
      borderRadius: "3px",
      marginBottom: "10px",
      marginTop: "25px",
      textAlign: "left",
    }}
  >
    <>
  <span style={{ textTransform: "uppercase" }}>
    {title}
  </span>

  {subtitle && (
    <span
      style={{
        textTransform: "none",
        fontWeight: 600,
      }}
    >
      {" "}
      ({subtitle})
    </span>
  )}
</>
  </div>
);

const costRow = (label, value) => (
  <div
    style={{
  width: "390px",          // <- add this
  display: "grid",
  gridTemplateColumns: "240px auto",
  alignItems: "center",
  columnGap: "20px",
  background: "#EEF1F4",
  borderRadius: "5px",
  padding: "5px 14px",
  marginBottom: "10px",
}}
  >
    <span
  style={{
    fontWeight: 600,
    color: "#111827",
    textAlign: "left",
    justifySelf: "start",
  }}
>
  {label}
</span>

    <span
  style={{
    fontWeight: 600,
    color: "#111827",
    textAlign: "left",
    justifySelf: "start",
  }}
>
  {value}
</span>

  </div>
);

const grandTotalRow = (value) => (
  <div
    style={{
  width: "390px",          // <- same width
  display: "grid",
  gridTemplateColumns: "240px auto",
  columnGap: "20px",
  alignItems: "center",
  background: "#DCEEFF",
  borderRadius: "6px",
  padding: "10px 16px",
  marginTop: "0px",
  marginBottom: "10px",
}}
  >
    <span
      style={{
        fontWeight: 700,
        fontSize: "18px",
        color: "#1E3A8A",
         textAlign: "left",
         justifySelf: "start",
      }}
    >
      GRAND TOTAL
    </span>

    <span
      style={{
        fontWeight: 700,
        fontSize: "20px",
        color: "#1E3A8A",
        textAlign: "left",
        justifySelf: "start",
      }}
    >
      {value}
    </span>
  </div>
);

const valueStyle = {
  whiteSpace: "nowrap",
};


const infoItem = (label, value) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "120px 15px 1fr",
      alignItems: "center",
      marginBottom: "8px",
    }}
  >
    <div style={{ fontWeight: 600 }}>
      {label}
    </div>

    <div>:</div>

    <div>{value}</div>
  </div>
);

const InfoRow = ({
  leftLabel,
  leftValue,
  rightLabel = "",
  rightValue = "",
}) => (
  <div
  style={{
    display: "grid",
    gridTemplateColumns:
      "110px 10px 220px 110px 10px 220px",
    alignItems: "center",
    columnGap: "2px",
    marginBottom: "8px",
  }}
>
    {/* Left Label */}
    <div
      style={{
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {leftLabel}
    </div>

    {/* Left Colon */}
    <div>:</div>

    {/* Left Value */}
    <div
      style={{
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
    >
      {leftValue}
    </div>

    {/* Right Label */}
    <div
      style={{
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {rightLabel}
    </div>

    {/* Right Colon */}
    <div>{rightLabel ? ":" : ""}</div>

    {/* Right Value */}
    <div
      style={{
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
    >
      {rightValue}
    </div>
  </div>
);
  const renderTourSummary = () => (
  <div
    style={{
      marginBottom: "25px",
      padding: "20px",
      background: "#f9fafb",
      borderRadius: "12px",
    }}
  >
  </div>
);

const renderPackageSections = () => (
  <>
  
  

{sectionHeading("🎯 SIGHTSEEING INCLUDED")}

<div
  style={{
    fontSize: "18px",
    lineHeight: "1.8",
    color: "#374151",
    textAlign: "left",
    marginBottom: "18px",
  }}
>
{[...(quoteData.sightseeing|| []), ...(quoteData.customSightseeing|| [])]
    .filter(Boolean)
    .map((item, index) => (
      <span key={index}>
        {index !== 0 && "  •  "}
        {item}
      </span>
    ))}
</div>
{sectionHeading("🚐 TRANSFERS INCLUDED")}

<div
  style={{
    fontSize: "18px",
    lineHeight: "1.8",
    color: "#374151",
    textAlign: "left",
    marginBottom: "18px",
  }}
>
  {[...(quoteData.transfers || []), ...(quoteData.customTransfers || [])]
    .filter(Boolean)
    .map((item, index) => (
      <span key={index}>
        {index !== 0 && "  •  "}
        {item}
      </span>
    ))}
</div>

{sectionHeading("🍽 Meals Included")}

<div
  style={{
    fontSize: "18px",
    lineHeight: "1.8",
    color: "#374151",
    textAlign: "left",
    marginBottom: "18px",
  }}
>
  {[...(quoteData.meals || []), ...(quoteData.customMeals  || [])]
    .filter(Boolean)
    .map((item, index) => (
      <span key={index}>
        {index !== 0 && "  •  "}
        {item}
      </span>
    ))}
</div>


{quoteData.visaRequired && (
  <>
    {sectionHeading(
  "🛂 VISA INFORMATION",
  "Visa Assistance Included"
)}
    <div
  style={{
    lineHeight: "1.8",
    fontSize: "18px",
    color: "#374151",
    marginBottom: "20px",
    textAlign: "left",
  }}
>

    {[
    ...(quoteData.visaServices || []),
    ...(quoteData.customVisaServices || []),
  ]
    .filter(item => item && item.trim() !== "")
    .join(" • ")}

</div>
  </>
)}

</>
);

const renderInclusionExclusion = () => {

  const inlineList = (items) =>
    (items || [])
      .filter(item => item && item.trim() !== "")
      .join(" • ");

  return (
    <>

      {sectionHeading("📄 INCLUSIONS")}

      <div
        style={{
          lineHeight: "1.8",
          fontSize: "18px",
          color: "#374151",
          marginBottom: "20px",
          textAlign: "left",
        }}
      >
        {inlineList([
  ...(quoteData.inclusions || []),
  ...(quoteData.customInclusions || [])
])}
      </div>

      {sectionHeading("❌ EXCLUSIONS")}

      <div
        style={{
          lineHeight: "1.8",
          fontSize: "18px",
          color: "#374151",
          marginBottom: "20px",
          textAlign: "left",
        }}
      >
        {inlineList([
  ...(quoteData.exclusions || []),
  ...(quoteData.customExclusions || [])
])}
      </div>

    </>
  );

};

const previewSummaryRow = (
  l1, v1,
  l2, v2,
  l3 = "", v3 = ""
) => (
  <tr>

    {/* LEFT */}

    <td
      style={{
         width: "120px",
        fontWeight: 600,
        whiteSpace: "nowrap",
        padding: "5px 3px",
      }}
    >
      {l1}
    </td>

    <td
      style={{
        width: "12px",
        textAlign: "center",
        padding: "5px 1px",
      }}
    >
      :
    </td>

    <td
      style={{
        width: "170px",
        padding: "5px 3px",
        whiteSpace: "nowrap",
overflow: "hidden",
textOverflow: "ellipsis",
      }}
    >
      {v1}
    </td>

    {/* MIDDLE */}

    <td
      style={{
         width: "105px",
        fontWeight: 600,
        whiteSpace: "nowrap",
        padding: "5px 3px",
      }}
    >
      {l2}
    </td>

    <td
      style={{
        width: "12px",
        textAlign: "center",
        padding: "5px 1px",
      }}
    >
      :
    </td>

    <td
      style={{
        width: "185px",
        padding: "5px 3px",
        whiteSpace: "nowrap",
overflow: "hidden",
textOverflow: "ellipsis",
      }}
    >
      {v2}
    </td>

    {/* RIGHT */}

    <td
      style={{
         width: "105px",
        fontWeight: 600,
        whiteSpace: "nowrap",
        padding: "5px 3px",
      }}
    >
      {l3}
    </td>

    <td
  style={{
    width: "12px",
    textAlign: "center",
    padding: "5px 1px",
  }}
>
  {l3 ? ":" : ""}
</td>

    <td
      style={{
        width: "170px",
        padding: "5px 3px",
       whiteSpace: "nowrap",
overflow: "hidden",
textOverflow: "ellipsis",
      }}
    >
      {v3}
    </td>

  </tr>
);

const renderItinerarySections = () => (
  <>
    {/* Itinerary mode content goes here */}
  </>
);


return (
  
  <div>

    {/* DOWNLOAD BUTTONS */}

    <div
      style={{
        display: "flex",
        gap: "10px",
        marginBottom: "20px"
      }}
    >
      <button
        onClick={downloadPDF}
        style={{
          background:"#2563eb",
          color:"#fff",
          border:"none",
          padding:"12px 20px",
          borderRadius:"8px",
          cursor:"pointer",
          fontWeight:"600"
        }}
      >
        📄 Download PDF
      </button>

      <button
        onClick={downloadWord}
        style={{
          background:"#16a34a",
          color:"#fff",
          border:"none",
          padding:"12px 20px",
          borderRadius:"8px",
          cursor:"pointer",
          fontWeight:"600"
        }}
      >
        📝 Download Word
      </button>
    </div>

    <div
      ref={quoteRef}
      style={{
        background:"#fff",
        padding:"32px",
        borderRadius:"16px",
        marginTop:"20px",
        maxWidth:"900px",
        marginInline:"auto",
        boxShadow:"0 4px 20px rgba(0,0,0,0.08)"
      }}
    >

     {/* HEADER */}

<div
  style={{
    textAlign: "center",
    borderBottom: "3px solid #2563eb",
    paddingBottom: "16px",
    marginBottom: "18px"
  }}
>
  <img
  src={orbitzLogo}
  alt="Orbitz Holidays"
  style={{
    width: "295px",
    height: "auto",
    display: "block",
    margin: "0 auto 8px auto"
  }}
/>

<p
  style={{
    marginTop: "4px",
    marginBottom: "10px",
    fontSize: "16px",
    fontStyle: "italic",
    fontWeight: 500,
    color: "#4B5563",
    fontFamily: "'Monotype Corsiva', Georgia, serif",
    letterSpacing: "0.5px",
  }}
>
  Anywhere, Anytime, Around the World
</p>

  <p
    style={{
      marginTop: "8px",
      marginBottom: "6px",
      fontWeight: "600",
      fontSize: "16px",
      color: "#444"
    }}
  >
    Domestic & International Tours | Visa Assistance | Holidays
  </p>

  <p
    style={{
      margin: "4px 0",
      fontSize: "14px",
      color: "#555"
    }}
  >
    🌐 www.orbitzholidays.com | 📞 +91 9330844031 | +91 9830489892
  </p>

  <p
    style={{
      marginTop: "6px",
      marginBottom: "0",
      fontSize: "14px",
      color: "#666"
    }}
  >
    B-7/37(s), Central Park, Kalyani, West Bengal - 741235
  </p>
</div>

{sectionHeading("🌍 TOUR SUMMARY")}

<table
  style={{
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: "8px",
    tableLayout: "fixed",
      }}
>
 
  <tbody>

    {/* Row 1 */}

    {previewSummaryRow(
  "Client Name",
  quoteData.clientName,

  "Mobile",
  quoteData.mobile,

  "Email",
  quoteData.email?.length > 19 ? (
    <span style={{ fontSize: "12px", whiteSpace: "nowrap" }}>
      {quoteData.email}
    </span>
  ) : (
    quoteData.email
  )
)}
      
    {/* Row 2 */}

   {previewSummaryRow(
  "Destination",
  quoteData.customDestination?.trim()
  ? quoteData.customDestination
  : quoteData.destination,

  "Travel Dates",
  `${formatShortDate(quoteData.travelFrom)} - ${formatShortDate(quoteData.travelTo)}`,

  "Duration",
  quoteData.quoteMode === "package"
    ? `${quoteData.totalDays} Days / ${quoteData.totalNights} Nights`
    : `${calculatedDays} Days / ${calculatedNights} Nights`
)}

        {/* Row 3 */}

    {previewSummaryRow(
      "Adults",
      quoteData.adults,

      "Children",
      quoteData.children,
      "Accomm.",
      quoteData.accommodation
    )}

        {/* Row 4 */}

    {previewSummaryRow(
      "Quotation No",
      shortQuotationNo(quoteData.quotationNo),

      "Date",
      formatDate(new Date()),
    "", ""
    )}

  </tbody>
</table>
      
{renderInclusionExclusion()}

{quoteData.quoteMode === "package" && (
  renderPackageSections()
)}

{/* DAY WISE ITINERARY */}

{quoteData.quoteMode === "itinerary" && (

<div
  style={{
    marginBottom: "25px"
  }}
>
  {sectionHeading("🗓 DAY WISE ITINERARY")}

  {(quoteData.itinerary || []).map(
    (day) => (
      <div
  key={day.day}
  style={{
    marginBottom: "18px",
    paddingBottom: "12px",
    borderBottom: "1px solid #E5E7EB",
    pageBreakInside: "avoid",
    breakInside: "avoid",
    WebkitColumnBreakInside: "avoid",
  }}
>
       <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "14px",
  }}
>
  {/* DAY + DATE Ribbon */}

  <div
    style={{
      background: "#C7CBD1",
      padding: "0px 5px",
      fontWeight: "700",
      fontSize: "16px",
      color: "#111827",
      display: "inline-block",
      whiteSpace: "nowrap",
    }}
  >
    DAY {day.day} —{" "}
    {(() => {
      const travelStart = new Date(quoteData.travelFrom);

      const itineraryDate = new Date(travelStart);

      itineraryDate.setDate(
        travelStart.getDate() + (day.day - 1)
      );

      return formatDate(itineraryDate);
    })()}
  </div>

  {/* TITLE Ribbon */}

  <div
    style={{
      background: "#C7CBD1",
      padding: "0px 5px",
      fontWeight: "700",
      fontSize: "16px",
      color: "#111827",
      display: "inline-block",
      whiteSpace: "nowrap",
    }}
  >
    {day.title}
  </div>
</div>

{day.description?.trim() && (
  <div
    style={{
      marginTop: "6px",
      
      fontStyle: "italic",
      lineHeight: "1.8",
      textAlign: "justify",
      fontSize: "15px",
      color: "#111827",
    }}
  >
    {day.description}
  </div>
)}



{(
  day.customCity ||
  day.city ||
  day.hotel ||
  day.customHotel ||

  ((day.mealMode || "chips") === "chips"
    ? (
        (day.meals?.length || 0) +
        (day.customMeals?.length || 0)
      ) > 0
    : day.mealText?.trim()
  ) ||

  ((day.transferMode || "chips") === "chips"
    ? (
        (day.transfers?.length || 0) +
        (day.customTransfers?.length || 0)
      ) > 0
    : day.transferText?.trim()
  ) ||

  ((day.sightseeingMode || "chips") === "chips"
    ? (day.selectedSightseeing?.length || 0) > 0
    : day.sightseeingText?.trim()
  )

) &&

  previewItineraryRow(
    "City:",
    <>
      {day.customCity || day.city || "-"}

      {"   ◆   "}

      <strong>Hotel:</strong>{" "}
      {day.customHotel || day.hotel || "-"}

      {day.hotelCategoryLabel &&
        ` (${day.hotelCategoryLabel})`}

      {"   ◆   "}

      

      <strong>Meals:</strong>{" "}

{(day.mealMode || "chips") === "chips"
  ? [
      ...(day.meals || []),
      ...(day.customMeals || [])
    ].join(" • ")
  : (day.mealText || "")
}
    </>
  )}

{(day.sightseeingMode || "chips") === "chips" ? (

  (
    day.selectedSightseeing?.length > 0
  ) &&
    previewItineraryRow(
      "Sightseeing:",
      day.selectedSightseeing
        .map(item =>
          item.description?.trim()
            ? `${item.name}\n${item.description}`
            : item.name
        )
        .join(" • ")
    )

) : (

  day.sightseeingText?.trim() &&
    previewItineraryRow(
      "Sightseeing:",
      day.sightseeingText
    )

)}

{(day.transferMode || "chips") === "chips" ? (

  (
    (day.transfers?.length || 0) +
    (day.customTransfers?.length || 0)
  ) > 0 &&

  previewItineraryRow(
    "Transfers:",
    [
      ...(day.transfers || []),
      ...(day.customTransfers || [])
    ].join(" • ")
  )

) : (

  day.transferText?.trim() &&

  previewItineraryRow(
    "Transfers:",
    day.transferText
  )

)}

      </div>
    )
  )}
</div>

)}

      {/* COSTING */}

      <div
  style={{
    marginBottom: "25px",
    
  }}
>
       {sectionHeading("💰 COST SUMMARY")}

<table
  style={{
    width: "calc(100% - 40px)",
    margin: "0 20px",
    borderCollapse: "collapse",
  }}
>
  <tbody>

  {quoteData.useVehicleCosting &&
quoteData.vehicleCosts?.length > 0 ? (

  quoteData.vehicleCosts.flatMap((vehicle) => {

  const cost = Number(vehicle.cost || 0);

  const gst =
    commonData?.applyGst
      ? cost * Number(commonData.gstPercent) / 100
      : 0;

  const total = cost + gst;

  const rows = [

    // Package Cost
    <tr key={`${vehicle.id}-cost`}>
      <td
        colSpan={2}
        style={{
          border: "none",
          padding: "0",
        }}
      >
        {costRow(
          `Package Cost With (${vehicle.vehicle})`,
          `₹${cost.toLocaleString()}`
        )}
      </td>
    </tr>

  ];

  // GST
  if (commonData?.applyGst) {
    rows.push(
      <tr key={`${vehicle.id}-gst`}>
        <td
          colSpan={2}
          style={{
            border: "none",
            padding: "0",
          }}
        >
          {costRow(
            `GST (${commonData.gstPercent}%)`,
            `₹${gst.toLocaleString()}`
          )}
        </td>
      </tr>
    );
  }

  // Grand Total
  rows.push(
    <tr key={`${vehicle.id}-total`}>
      <td
        colSpan={2}
        style={{
          border: "none",
          padding: "0",
        }}
      >
        {grandTotalRow(
          `₹${total.toLocaleString()}`
        )}
      </td>
    </tr>
  );

  return rows;

})
) : (

  <tr>
  <td
    colSpan={2}
    style={{
      border: "none",
      padding: "0",
    }}
  >
    {costRow(
      "Package Cost",
      `₹${subtotal.toLocaleString()}`
    )}
  </td>
</tr>
)}
   {!quoteData.useVehicleCosting &&
   commonData?.applyGst && (
  <tr>
  <td
    colSpan={2}
    style={{
      border: "none",
      padding: "0",
    }}
  >
    {costRow(
      `GST (${commonData?.gstPercent || 0}%)`,
      `₹${gstAmount.toLocaleString()}`
    )}
  </td>
</tr>
)}

    {!quoteData.useVehicleCosting && (
  <tr>
  <td
    colSpan={2}
    style={{
      border: "none",
      padding: "0",
    }}
  >
    {grandTotalRow(
      `₹${grandTotal.toLocaleString()}`
    )}
  </td>
</tr>
)}

{quoteData?.showUsd &&
 !quoteData.useVehicleCosting && (

<tr>
  <td
    colSpan={2}
    style={{
      border: "none",
      padding: "0",
    }}
  >
    {costRow(
      "USD Equivalent",
      `$${(
        grandTotal /
        Number(quoteData?.usdRate || 86)
      ).toFixed(2)}`
    )}
  </td>
</tr>

)}
  </tbody>
</table>
</div>

      {/* IMPORTANT NOTES & TERMS */}

<div
  style={{
    marginTop: "10px",
  }}
>
  {sectionHeading("📌 IMPORTANT NOTES & TERMS")}

  {quoteData.specialNotes?.trim() && (
  <p
    style={{
      lineHeight: "1.7",
      marginBottom: "10px",
       fontSize: "16px",
      textAlign: "left"
          }}
  >
    <strong>Special Notes:</strong>{" "}
    {quoteData.specialNotes
      .split(",")
      .map(note => note.trim())
      .filter(Boolean)
      .join(" • ")}
  </p>
)}

  <p
  style={{
    lineHeight: "1.7",
    marginTop: "6px",
    marginBottom: 0,
    marginLeft: 0,
    textAlign: "left",
    fontSize: "15px",
    whiteSpace: "nowrap",
  }}
>
  {(quoteData.terms || []).join(" • ")}
</p>
</div>

{/* FOOTER */}

<div
  style={{
    borderTop: "3px solid #2563EB",
    marginTop: "24px",
    paddingTop: "16px",
    textAlign: "center",
  }}
>
  <div
    style={{
      fontSize: "18px",
      fontWeight: "700",
      color: "#1E3A8A",
      letterSpacing: "0.4px",
      marginBottom: "4px",
    }}
  >
    ✈ Thank You for Choosing Orbitz Holidays ✈
  </div>

  <div
    style={{
      fontSize: "14px",
      fontStyle: "italic",
      color: "#6B7280",
      fontFamily: "Georgia, serif",
      letterSpacing: "0.3px",
    }}
  >
    Anywhere, Anytime, Around the World
  </div>
</div>

</div>
</div>
);
}