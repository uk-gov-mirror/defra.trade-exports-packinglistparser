/**
 * SAVERS Model 2 CSV Test Data
 *
 * Test data models for SAVERS2 CSV packing list parser.
 */

const declarationText =
  'I, the responsible person, confirm that all ROW origin goods in this consignment are eligible to move under NIRMS because they have either: successfully passed checks at an EU BCP; been processed in GB; are products where the UK is taking the same approach as the EU to protect against similar pests and diseases; meet EU IUU regulations or have no SPS, certification or control requirements.'

const headerRow = [
  'Export Invoice No.',
  'Item',
  'Item Description',
  'UK Commodity Code',
  'EU Commodity Code',
  'Case Weight (KGs)',
  'Country of Origin',
  'CASE Quantity',
  'Net Weight (KGs)',
  'NIRMS / SPS Item',
  'Nature of Product',
  'Type of Treatment'
]

const dataRow1 = [
  '158827257',
  '1212',
  'HARMONY HAIRSPRAY FIRM 225ML',
  '9999999999',
  '3305900000',
  '2.68',
  'GB',
  '1',
  '2.680',
  'No',
  'Ambient',
  'Unprocessed'
]

const dataRow2 = [
  '158827257',
  '3632',
  "HERMESETAS ORIG. 300'S",
  '8888888888',
  '2106909849',
  '0.34',
  'GB',
  '1',
  '0.340',
  'Yes',
  'Ambient',
  'Processed'
]

const validModel = [
  ['GC Ref: RMS/2026/1721152775211'],
  ['Savers - Packing List'],
  ['Declaration:', declarationText],
  ['RMS', 'RMS-GB-000247-002', '', 'ENTER BU ID', 'SVNI', '', '', '2544', '5329'],
  [],
  headerRow,
  dataRow1,
  dataRow2
]

const emptyModel = []

const wrongEstablishmentNumber = [
  ['GC Ref: RMS/2026/1721152775211'],
  ['Savers - Packing List'],
  ['RMS', 'RMS-GB-999999-999', '', 'ENTER BU ID', 'SVNI'],
  [],
  headerRow,
  dataRow1,
  dataRow2
]

const wrongHeaders = [
  ['GC Ref: RMS/2026/1721152775211'],
  ['Savers - Packing List'],
  ['RMS', 'RMS-GB-000247-002', '', 'ENTER BU ID', 'SVNI'],
  [],
  [
    'Export Invoice No.',
    'Item',
    'wrong_description',
    'UK Commodity Code',
    'wrong_commodity',
    'Case Weight (KGs)',
    'wrong_country',
    'wrong_quantity',
    'wrong_weight',
    'wrong_nirms',
    'wrong_nature',
    'wrong_treatment'
  ],
  dataRow1
]

const invalidModel_MissingColumnCells = [
  ['GC Ref: RMS/2026/1721152775211'],
  ['Savers - Packing List'],
  ['RMS', 'RMS-GB-000247-002', '', 'ENTER BU ID', 'SVNI'],
  [],
  headerRow,
  [
    '158827257',
    '1212',
    '',
    '9999999999',
    '3305900000',
    '2.68',
    'GB',
    '1',
    '2.680',
    'No',
    'Ambient',
    'Unprocessed'
  ]
]

const invalidModel = [
  ['GC Ref: RMS/2026/1721152775211'],
  ['Savers - Packing List'],
  [],
  headerRow,
  dataRow1,
  dataRow2
]

export default {
  validModel,
  emptyModel,
  wrongEstablishmentNumber,
  wrongHeaders,
  invalidModel_MissingColumnCells,
  invalidModel
}
