/**
 * Greggs Model 1 PDF expected parser-service results.
 */
import parserModel from '../../../../src/services/parser-model.js'
import failureReasonsDescriptions from '../../../../src/services/validators/packing-list-failure-reasons.js'

export default {
  validTestResult: {
    business_checks: {
      all_required_fields_present: true,
      failure_reasons: null
    },
    items: [
      {
        description: 'Sausage Roll',
        nature_of_products: 'Frozen',
        type_of_treatment: 'Processed',
        commodity_code: null,
        number_of_packages: '214',
        total_net_weight_kg: '1763.36',
        total_net_weight_unit: 'kg',
        nirms: 'NIRMS',
        country_of_origin: 'GB'
      },
      {
        description: 'Steak Bake',
        nature_of_products: 'Frozen',
        type_of_treatment: 'Processed',
        commodity_code: null,
        number_of_packages: '31',
        total_net_weight_kg: '220.10',
        total_net_weight_unit: 'kg',
        nirms: 'NIRMS',
        country_of_origin: 'GB'
      },
      {
        description: 'Chicken Bake',
        nature_of_products: 'Frozen',
        type_of_treatment: 'Processed',
        commodity_code: null,
        number_of_packages: '21',
        total_net_weight_kg: '161.70',
        total_net_weight_unit: 'kg',
        nirms: 'NIRMS',
        country_of_origin: 'GB'
      }
    ],
    registration_approval_number: 'RMS-GB-000021-001',
    parserModel: parserModel.GREGGS1
  },

  emptyTestResult: {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons: failureReasonsDescriptions.EMPTY_DATA
    },
    items: [],
    registration_approval_number: 'RMS-GB-000021-001',
    parserModel: parserModel.GREGGS1
  },

  invalidTestResult_MissingCells: {
    business_checks: {
      all_required_fields_present: false
    },
    registration_approval_number: 'RMS-GB-000021-001',
    parserModel: parserModel.GREGGS1
  }
}
