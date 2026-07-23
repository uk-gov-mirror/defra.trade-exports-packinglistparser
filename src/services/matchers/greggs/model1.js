/**
 * Greggs Model 1 PDF Matcher
 *
 * Matches Greggs landscape PDF packing lists using coordinate-based extraction.
 * Validates establishment number and header positions.
 */
import { createLogger } from '../../../common/helpers/logging/logger.js'
import { formatError } from '../../../common/helpers/logging/error-logger.js'
import matcherResult from '../../matcher-result.js'
import headers from '../../model-headers-pdf.js'
import * as regex from '../../../utilities/regex.js'
import * as pdfHelper from '../../../utilities/pdf-helper.js'

const logger = createLogger()

/**
 * Check if packing list matches Greggs Model 1 format.
 * @param {Buffer} packingList - PDF file buffer
 * @param {string} filename - Original filename
 * @returns {Promise<number>} Match result code
 */
export async function matches(packingList, filename) {
  try {
    const pdfJson = await pdfHelper.extractPdf(packingList)

    if (pdfJson.pages.length === 0) {
      return matcherResult.EMPTY_FILE
    }

    // Headers only appear on the first page
    const firstPage = pdfJson.pages[0]

    // Check for correct establishment number
    if (
      !regex.test(headers.GREGGS1.establishmentNumber.regex, firstPage.content)
    ) {
      return matcherResult.WRONG_ESTABLISHMENT_NUMBER
    }

    // Match header
    const result = findHeader(firstPage.content)

    if (result === matcherResult.CORRECT) {
      logger.info(`${filename} Packing list matches Greggs Model 1`)
    }

    return result
  } catch (err) {
    logger.error(formatError(err), 'Error in matches() for Greggs Model 1')
    return matcherResult.GENERIC_ERROR
  }
}

/**
 * Locate and validate headers for Greggs Model 1 within page content.
 * Validates that each model header regex matches at least one extracted text element on the page.
 * @param {Array} pageContent - Extracted page content
 * @returns {number} matcherResult - `CORRECT` if all headers match, otherwise `WRONG_HEADER`
 */
function findHeader(pageContent) {
  const greggsHeaders = headers.GREGGS1.headers

  for (const headerField in greggsHeaders) {
    if (!Object.hasOwn(greggsHeaders, headerField)) {
      continue
    }

    const matchFound = pageContent.some((item) =>
      greggsHeaders[headerField].regex.test(item.str)
    )

    if (!matchFound) {
      return matcherResult.WRONG_HEADER
    }
  }

  return matcherResult.CORRECT
}
