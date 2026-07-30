/**
 * Greggs Model 1 PDF test data (landscape orientation).
 *
 * Mock output of pdfHelper.extractPdf() for a Greggs packing list. Coordinates
 * mirror the real Greggs template: header labels are rendered above and offset
 * from the column data beneath them, multi-word headers (e.g. "TOTAL NET
 * WEIGHT kg") wrap across two lines as separate items, an unmodelled
 * "Manufacturing Plant approval code" column sits between description and order
 * quantity, and data rows are packed tightly (~6px pitch) with a description
 * line sitting ~0.5px above its data line.
 */

// Header band Y coordinates (two wrapped lines)
const HEADER_Y_TOP = 95
const HEADER_Y_MID = 98
const HEADER_Y_BOTTOM = 100

// Shared header content used across the valid model variants. The "WEIGHT kg"
// items are the wrapped second lines of the TOTAL GROSS / TOTAL NET columns and
// carry the net weight unit resolved by discoverNetWeightUnit.
const validHeaders = [
  { x: 312, y: HEADER_Y_TOP, str: 'TOTAL GROSS', width: 45 },
  { x: 405, y: HEADER_Y_TOP, str: 'TOTAL NET', width: 45 },
  {
    x: 611,
    y: HEADER_Y_TOP,
    str: 'GB Place of Dispatch (Establishment)',
    width: 130
  },
  { x: 61, y: HEADER_Y_MID, str: 'Article', width: 30 },
  { x: 111, y: HEADER_Y_MID, str: 'Short description', width: 70 },
  {
    x: 186,
    y: HEADER_Y_MID,
    str: 'Manufacturing Plant approval code',
    width: 60
  },
  { x: 272, y: HEADER_Y_MID, str: 'ORDER QTY', width: 45 },
  { x: 358, y: HEADER_Y_MID, str: 'TOTAL PRICE £', width: 60 },
  { x: 446, y: HEADER_Y_MID, str: 'Nature of Product', width: 50 },
  { x: 501, y: HEADER_Y_MID, str: 'Type of Treatment', width: 50 },
  { x: 556, y: HEADER_Y_MID, str: 'NIRMS or Non-NRIMS', width: 60 },
  { x: 687, y: HEADER_Y_MID, str: 'Flag for Port Checks', width: 50 },
  { x: 737, y: HEADER_Y_MID, str: 'Country of origin', width: 60 },
  { x: 316, y: HEADER_Y_BOTTOM, str: 'WEIGHT kg', width: 40 },
  { x: 406, y: HEADER_Y_BOTTOM, str: 'WEIGHT kg', width: 40 },
  { x: 630, y: HEADER_Y_BOTTOM, str: 'Scheme Number', width: 60 }
]

// Header band without the wrapped "WEIGHT kg" unit lines.
const headersWithoutKgUnit = validHeaders.filter(
  (item) => item.str !== 'WEIGHT kg'
)

// Footer / page markers that bound the data region
const footer = [
  { x: 53, y: 148, str: 'TOTALS:', width: 30 },
  { x: 40, y: 152, str: 'Page 1 of 1', width: 40 }
]

/**
 * Build a single data row of content items at the given base Y coordinate.
 * The description sits on the base line while the numeric/category cells sit
 * ~0.5px below it, matching the real template's per-cell Y offsets.
 * @param {number} yBase - Row base Y coordinate (description line)
 * @param {Object} values - Column values keyed by field
 * @returns {Array<Object>} Content items for the row
 */
function buildRow(yBase, values) {
  return [
    { x: 53, y: yBase, str: values.article ?? '5000000', width: 15 },
    { x: 82, y: yBase, str: values.description, width: 60 },
    { x: 702, y: yBase + 0.2, str: 'SPS', width: 10 },
    { x: 750, y: yBase + 0.2, str: values.countryOfOrigin, width: 15 },
    { x: 283, y: yBase + 0.5, str: values.orderQty, width: 10 },
    { x: 323, y: yBase + 0.5, str: values.grossWeight, width: 20 },
    { x: 369, y: yBase + 0.5, str: values.price, width: 20 },
    { x: 413, y: yBase + 0.5, str: values.netWeight, width: 20 },
    { x: 456, y: yBase + 0.5, str: values.nature, width: 30 },
    { x: 509, y: yBase + 0.5, str: values.treatment, width: 40 },
    { x: 558, y: yBase + 0.5, str: values.nirms, width: 60 },
    { x: 630, y: yBase + 0.5, str: 'RMS-GB-000021-001', width: 60 }
  ]
}

const validRows = [
  buildRow(110, {
    article: '5000384',
    description: 'Sausage Roll',
    orderQty: '214',
    grossWeight: '2127.16',
    price: '1000.00',
    netWeight: '1763.36',
    nature: 'Frozen',
    treatment: 'Processed',
    nirms: 'Moving under NIRMS',
    countryOfOrigin: 'GB'
  }),
  buildRow(116, {
    article: '5001553',
    description: 'Steak Bake',
    orderQty: '31',
    grossWeight: '272.80',
    price: '200.00',
    netWeight: '220.10',
    nature: 'Frozen',
    treatment: 'Processed',
    nirms: 'Moving under NIRMS',
    countryOfOrigin: 'GB'
  }),
  buildRow(122, {
    article: '2001027',
    description: 'Chicken Bake',
    orderQty: '21',
    grossWeight: '197.40',
    price: '150.00',
    netWeight: '161.70',
    nature: 'Frozen',
    treatment: 'Processed',
    nirms: 'Moving under NIRMS',
    countryOfOrigin: 'GB'
  })
]

export default {
  validModel: {
    pages: [
      {
        pageInfo: { num: 1 },
        content: [...validHeaders, ...validRows.flat(), ...footer]
      }
    ]
  },

  emptyModel: {
    pages: [
      {
        pageInfo: { num: 1 },
        content: [
          { x: 630, y: 50, str: 'RMS-GB-000021-001', width: 60 },
          ...validHeaders,
          ...footer
        ]
      }
    ]
  },

  invalidModel_WrongHeaders: {
    pages: [
      {
        pageInfo: { num: 1 },
        content: [
          { x: 630, y: 110, str: 'RMS-GB-000021-001', width: 60 },
          { x: 111, y: HEADER_Y_MID, str: 'Wrong', width: 70 },
          { x: 272, y: HEADER_Y_MID, str: 'ORDER QTY', width: 45 }
        ]
      }
    ]
  },

  invalidModel_WrongRemosNumber: {
    pages: [
      {
        pageInfo: { num: 1 },
        content: [
          { x: 630, y: 110, str: 'RMS-GB-000099-001', width: 60 },
          ...validHeaders
        ]
      }
    ]
  },

  invalidModel_MissingColumnCells: {
    pages: [
      {
        pageInfo: { num: 1 },
        content: [
          ...validHeaders,
          // Row missing the ORDER QTY and TOTAL NET WEIGHT cells
          { x: 53, y: 110, str: '5000384', width: 15 },
          { x: 82, y: 110, str: 'Sausage Roll', width: 60 },
          { x: 750, y: 110.2, str: 'GB', width: 15 },
          { x: 456, y: 110.5, str: 'Frozen', width: 30 },
          { x: 509, y: 110.5, str: 'Processed', width: 40 },
          { x: 558, y: 110.5, str: 'Moving under NIRMS', width: 60 },
          { x: 630, y: 110.5, str: 'RMS-GB-000021-001', width: 60 },
          ...footer
        ]
      }
    ]
  },

  invalidModel_NonNumeric: {
    pages: [
      {
        pageInfo: { num: 1 },
        content: [
          ...validHeaders,
          ...buildRow(110, {
            article: '5000384',
            description: 'Sausage Roll',
            orderQty: 'abc',
            grossWeight: '2127.16',
            price: '1000.00',
            netWeight: 'not-a-number',
            nature: 'Frozen',
            treatment: 'Processed',
            nirms: 'Moving under NIRMS',
            countryOfOrigin: 'GB'
          }),
          ...footer
        ]
      }
    ]
  },

  missingKgUnit: {
    pages: [
      {
        pageInfo: { num: 1 },
        content: [
          ...headersWithoutKgUnit,
          ...buildRow(110, {
            article: '5000384',
            description: 'Sausage Roll',
            orderQty: '214',
            grossWeight: '2127.16',
            price: '1000.00',
            netWeight: '1763.36',
            nature: 'Frozen',
            treatment: 'Processed',
            nirms: 'Moving under NIRMS',
            countryOfOrigin: 'GB'
          }),
          ...footer
        ]
      }
    ]
  }
}
