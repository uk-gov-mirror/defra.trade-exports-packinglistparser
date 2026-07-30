/**
 * Greggs model headers
 *
 * Provides establishment number patterns and field mappings
 * for Greggs packing list variants (landscape PDF, coordinate-based).
 *
 * The Greggs template renders header labels that do not line up with the
 * column data beneath them (for example the "Short description" label sits to
 * the right of where the description values start) and it includes an
 * unmodelled "Manufacturing Plant approval code" column between description and
 * order quantity. Header-position-derived boundaries therefore clip or bleed
 * columns, so explicit x-boundaries (x1/x2) are declared per column and used
 * directly by the parser. The `regex` values remain for header matching and
 * for locating the net weight unit.
 */

const pdfGreggsHeaders = {
  GREGGS1: {
    establishmentNumber: {
      regex: /RMS-GB-000021(-\d{3})?/i,
      establishmentRegex: /RMS-GB-000021(-\d{3})?/i
    },
    headers: {
      description: {
        regex: /Short description/i,
        x1: 70,
        x2: 165
      },
      number_of_packages: {
        regex: /ORDER QTY/i,
        x1: 250,
        x2: 300
      },
      total_net_weight_kg: {
        // The header wraps across two lines ("TOTAL NET" above "WEIGHT kg"), so
        // pdf.js-extract emits them as separate items. Match the distinctive
        // first fragment, which is unique versus the adjacent "TOTAL GROSS" and
        // "TOTAL PRICE" columns. The "kg" unit is resolved separately from the
        // wrapped line by discoverNetWeightUnit.
        regex: /TOTAL NET/i,
        x1: 395,
        x2: 440
      },
      nature_of_products: {
        regex: /Nature of Product/i,
        x1: 445,
        x2: 495
      },
      type_of_treatment: {
        regex: /Type of Treatment/i,
        x1: 498,
        x2: 545
      }
    },
    country_of_origin: {
      regex: /Country of origin/i,
      x1: 740,
      x2: 780
    },
    nirms: {
      regex: /NIRMS or Non/i,
      x1: 548,
      x2: 600
    },
    // Validation flags
    validateCountryOfOrigin: true,
    findUnitInHeader: true,
    // Footer pattern marking the end of the data region on each page. The
    // final page ends with a "TOTALS:" / "Sub-Totals:" block, and every page
    // ends with a "Page X of Y" / "Document Created:" line.
    footer: /TOTALS:|Sub-Totals|Document Created|Page \d+ of \d+/i,
    // Page number pattern
    pageNumber: /Page \d+ of \d+/i,
    // First page pattern (identifies the page that carries the column header)
    firstPage: /Page 1 of \d+/i,
    deprecated: false
  }
}

export { pdfGreggsHeaders }
