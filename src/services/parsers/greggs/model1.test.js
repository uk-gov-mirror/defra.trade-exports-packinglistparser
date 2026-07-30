/**
 * Greggs Model 1 PDF parser tests
 *
 * Tests the parser logic for Greggs landscape packing list PDFs.
 */
import { describe, test, expect, afterEach, vi } from 'vitest'
import model from '../../../../test/test-data-and-results/models-pdf/greggs/model1.js'
import test_results from '../../../../test/test-data-and-results/results-pdf/greggs/model1.js'

// Mock pdf-helper before importing the parser
vi.mock('../../../utilities/pdf-helper.js', async () => {
  const actual = await vi.importActual('../../../utilities/pdf-helper.js')
  return {
    ...actual,
    extractPdf: vi.fn()
  }
})

const { extractPdf } = await import('../../../utilities/pdf-helper.js')
const { parse } = await import('./model1.js')

describe('parseGreggs1', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  test('returns NOMATCH when extracted PDF has no pages', async () => {
    extractPdf.mockImplementation(() => ({ pages: [] }))

    const result = await parse(Buffer.from('empty-pages'))

    expect(result).toMatchObject({
      registration_approval_number: null,
      items: [],
      parserModel: 'NOMATCH',
      establishment_numbers: []
    })
  })

  test('parses a valid Greggs packing list and normalises NIRMS values', async () => {
    extractPdf.mockImplementation(() => model.validModel)

    const result = await parse({})

    expect(result).toMatchObject(test_results.validTestResult)
    expect(result.items.every((item) => item.nirms === 'NIRMS')).toBe(true)
  })

  test('returns empty items for a packing list with no data rows', async () => {
    extractPdf.mockImplementation(() => model.emptyModel)

    const result = await parse({})

    expect(result.items).toEqual([])
    expect(result.parserModel).toBe('GREGGS1')
  })

  test('returns NOMATCH when an error is thrown', async () => {
    extractPdf.mockImplementation(() => {
      throw new Error('Test error')
    })

    const result = await parse(null)

    expect(result.parserModel).toBe('NOMATCH')
  })
})
