/**
 * Savers Model 2 CSV Parser Tests
 */
import { describe, test, expect, beforeEach, vi } from 'vitest'
import { parse } from './model2.js'
import parserModel from '../../parser-model.js'
import model from '../../../../test/test-data-and-results/models-csv/savers/model2.js'
import expectedResults from '../../../../test/test-data-and-results/results-csv/savers/model2.js'

describe('Savers Model 2 CSV Parser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('should parse valid Savers Model 2 CSV correctly', () => {
    const result = parse(model.validModel)
    expect(result).toMatchObject(expectedResults.validTestResult)
  })

  test('should return NOMATCH for empty CSV', () => {
    const result = parse(model.emptyModel)
    expect(result.parserModel).toBe(parserModel.NOMATCH)
    expect(result.business_checks.all_required_fields_present).toBe(false)
  })

  test('should return NOMATCH for null input', () => {
    const result = parse(null)
    expect(result.parserModel).toBe(parserModel.NOMATCH)
  })

  test('should return NOMATCH when establishment number is missing', () => {
    const result = parse(model.invalidModel)
    expect(result.parserModel).toBe(parserModel.NOMATCH)
    expect(result.business_checks.all_required_fields_present).toBe(false)
  })

  test('should extract all establishment numbers', () => {
    const result = parse(model.validModel)
    expect(result.establishment_numbers).toContain('RMS-GB-000247-002')
  })

  test('should extract correct number of items', () => {
    const result = parse(model.validModel)
    expect(result.items.length).toBe(2)
  })

  test('should handle malformed data without throwing', () => {
    const malformedData = {
      0: ['header'],
      1: ['data']
    }

    const result = parse(malformedData)
    expect(result.parserModel).toBe(parserModel.NOMATCH)
  })
})
