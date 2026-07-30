/**
 * Greggs PDF parser - Model 1
 *
 * Parses Greggs landscape PDF packing lists using coordinate-based extraction.
 *
 * The Greggs template packs data rows tightly (~5-6px pitch) and its header
 * labels do not align with the column data beneath them, so column x-ranges are
 * taken from explicit per-column boundaries declared in the model config rather
 * than being derived from header text positions. Rows are located by clustering
 * item Y-coordinates; the header band (first page only) and page footer bound
 * the data region.
 * @module parsers/greggs/model1
 */
import { createLogger } from '../../../common/helpers/logging/logger.js'
import { formatError } from '../../../common/helpers/logging/error-logger.js'
import * as combineParser from '../../parser-combine.js'
import parserModel from '../../parser-model.js'
import headers from '../../model-headers-pdf.js'
import * as regex from '../../../utilities/regex.js'
import {
  mapPdfDynamicHeaderParser,
  discoverNetWeightUnit
} from '../../parser-map-pdf.js'
import {
  extractPdf,
  extractEstablishmentNumbers
} from '../../../utilities/pdf-helper.js'

const logger = createLogger()

const MODEL = 'GREGGS1'

/**
 * Maximum Y difference (in pixels) between consecutive item Y-coordinates for
 * them to be treated as the same logical row. Greggs rows are ~5-6px apart
 * while cells within a row differ by at most ~1px, so a small tolerance cleanly
 * separates adjacent rows.
 */
const ROW_Y_TOLERANCE = 3

/**
 * Header label patterns used to locate the bottom of the header band on the
 * page that carries it. Includes the wrapped second-line labels ("WEIGHT kg",
 * "Scheme Number") so the data region starts strictly below the whole block.
 */
const HEADER_BLOCK_REGEXES = [
  /Short description/i,
  /ORDER QTY/i,
  /TOTAL NET/i,
  /TOTAL GROSS/i,
  /Nature of Product/i,
  /Type of Treatment/i,
  /NIRMS or Non/i,
  /Country of origin/i,
  /WEIGHT kg/i,
  /Scheme Number/i,
  /Place of Dispatch/i
]

/**
 * Matches the Greggs NIRMS column phrasing (e.g. "Moving under NIRMS").
 * Greggs states NIRMS eligibility as a sentence rather than a recognised token,
 * so it is normalised to the canonical "NIRMS" value expected by validation.
 */
const MOVING_UNDER_NIRMS_REGEX = /moving under nirms/i

/**
 * Build the column extraction boundaries from the explicit x1/x2 values
 * declared in the model config.
 * @returns {Object} Map of field name to { x1, x2 } for the core data columns
 */
function buildHeaderBoundaries() {
  const boundaries = {}
  for (const [key, config] of Object.entries(headers[MODEL].headers)) {
    boundaries[key] = { x1: config.x1, x2: config.x2 }
  }
  return boundaries
}

/**
 * Normalise Greggs NIRMS column phrasing to the canonical token expected by
 * downstream validation. Rows that state goods are "Moving under NIRMS" are
 * mapped to "NIRMS"; other values (for example "Non-NIRMS") are left untouched.
 * @param {Array<Object>} rows - Parsed packing list rows
 * @returns {Array<Object>} Rows with normalised NIRMS values
 */
function normaliseNirmsValues(rows) {
  for (const row of rows) {
    if (row.nirms && MOVING_UNDER_NIRMS_REGEX.test(row.nirms)) {
      row.nirms = 'NIRMS'
    }
  }
  return rows
}

/**
 * Find the Y coordinate of the bottom of the header band on a page.
 * @param {Array} pageContent - PDF page content
 * @returns {number} Y coordinate of the lowest header label, or 0 if none found
 */
function findHeaderBottom(pageContent) {
  const headerYs = pageContent
    .filter((item) =>
      HEADER_BLOCK_REGEXES.some((pattern) => pattern.test(item.str))
    )
    .map((item) => item.y)

  return headerYs.length > 0 ? Math.max(...headerYs) : 0
}

/**
 * Determine the Y coordinates of the data rows on a single page.
 *
 * The header only appears on the page carrying the "Page 1 of N" marker; on
 * that page data starts below the header band, otherwise it starts from the top
 * of the page. The footer line ("TOTALS:" / "Page X of Y" / "Document Created:")
 * marks the end of the data region. Item Y-coordinates are clustered into
 * logical rows so that cells rendered at slightly different Y values (a
 * description line often sits ~1px above its data line) are treated as one row.
 * Each row is represented by the mean Y of its cluster so that every line in
 * the row falls within the ±1px tolerance used when reading column values.
 * @param {Array} pageContent - PDF page content array with positioned items
 * @returns {Array<number>} Ascending Y coordinates, one per data row
 */
export function getYsForRows(pageContent) {
  try {
    const model = headers[MODEL]
    const hasHeader = pageContent.some((item) =>
      model.headers.description.regex.test(item.str)
    )
    const firstY = hasHeader ? findHeaderBottom(pageContent) : 0

    const footerY = pageContent.find((item) => model.footer.test(item.str))?.y
    const lastY = footerY ?? Number.POSITIVE_INFINITY

    const rowYs = [
      ...new Set(
        pageContent
          .filter(
            (item) =>
              item.y > firstY && item.y < lastY && item.str.trim() !== ''
          )
          .map((item) => item.y)
      )
    ].sort((a, b) => a - b)

    const clusters = []
    for (const y of rowYs) {
      const current = clusters.at(-1)
      if (current && y - current.at(-1) <= ROW_Y_TOLERANCE) {
        current.push(y)
      } else {
        clusters.push([y])
      }
    }

    return clusters.map(
      (cluster) => cluster.reduce((sum, y) => sum + y, 0) / cluster.length
    )
  } catch (err) {
    logger.error(formatError(err), 'Error in getYsForRows()')
    return []
  }
}

/**
 * Determine whether a parsed row carries no meaningful data.
 * @param {Object} row - Parsed row object
 * @returns {boolean} True if the row is empty
 */
function isEmptyRow(row) {
  return (
    !row.description &&
    !row.number_of_packages &&
    !row.total_net_weight_kg &&
    !row.type_of_treatment &&
    !row.nature_of_products
  )
}

/**
 * Extract packing list rows from every page of the document.
 * @param {Array} pages - Array of PDF pages
 * @param {Object} headerBoundaries - Column x-boundaries
 * @param {Object} nirmsBoundary - NIRMS column x-boundary
 * @param {Object} coBoundary - Country of origin column x-boundary
 * @param {string|null} netWeightUnit - Resolved net weight unit
 * @returns {Array} Combined packing list rows from all pages
 */
function processPages(
  pages,
  headerBoundaries,
  nirmsBoundary,
  coBoundary,
  netWeightUnit
) {
  let allContents = []

  for (const page of pages) {
    const ys = getYsForRows(page.content)
    const pageContents = mapPdfDynamicHeaderParser(
      page,
      MODEL,
      ys,
      headerBoundaries,
      nirmsBoundary,
      coBoundary,
      netWeightUnit
    )
    allContents = allContents.concat(pageContents)
  }

  return allContents
}

/**
 * Parse a Greggs Model 1 PDF document using coordinate-based extraction.
 * @param {Buffer} packingList - PDF file buffer
 * @returns {Promise<Object>} Combined parser result with items and metadata
 */
export async function parse(packingList) {
  try {
    const pdfJson = await extractPdf(packingList)

    if (pdfJson.pages.length === 0) {
      return combineParser.combine(null, [], false, parserModel.NOMATCH, [])
    }

    const firstPage = pdfJson.pages[0]

    const establishmentNumber = regex.findMatch(
      headers[MODEL].establishmentNumber.regex,
      firstPage.content
    )

    const establishmentNumbers = extractEstablishmentNumbers(pdfJson)

    const headerBoundaries = buildHeaderBoundaries()
    const nirmsBoundary = {
      x1: headers[MODEL].nirms.x1,
      x2: headers[MODEL].nirms.x2
    }
    const coBoundary = {
      x1: headers[MODEL].country_of_origin.x1,
      x2: headers[MODEL].country_of_origin.x2
    }
    const netWeightUnit = discoverNetWeightUnit(firstPage.content, MODEL)

    const packingListContents = processPages(
      pdfJson.pages,
      headerBoundaries,
      nirmsBoundary,
      coBoundary,
      netWeightUnit
    )

    const filteredContents = normaliseNirmsValues(
      packingListContents.filter((row) => !isEmptyRow(row))
    )

    return combineParser.combine(
      establishmentNumber,
      filteredContents,
      true,
      parserModel.GREGGS1,
      establishmentNumbers,
      headers[MODEL]
    )
  } catch (err) {
    logger.error(formatError(err), 'Error in parse()')
    return combineParser.combine(null, [], false, parserModel.NOMATCH, [])
  }
}
