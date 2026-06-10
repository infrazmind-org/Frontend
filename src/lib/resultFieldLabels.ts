/** Human labels for API response keys. */
const KEY_LABELS: Record<string, string> = {
  searchType: 'Input type',
  searchValue: 'Input value',
  productSlug: 'Product',
  status: 'Status',
  message: 'Message',
  result_code: 'Result code',
  result: 'Response payload',
  providerRef: 'Provider reference',
  transaction_id: 'Transaction ID',
  url: 'Session / consent URL',
  report: 'Skip tracing report',
  report_url: 'Report',
  expires_on: 'Expires (ITR)',
  expires: 'Expires (Ecom)',
  detail: 'Error detail',
  creditsRemaining: 'Credits remaining',
  http_response_code: 'HTTP code',
  request_id: 'Request ID',
  client_ref_num: 'Client reference',
  pan: 'PAN',
  pan_type: 'PAN type',
  fullname: 'Full name',
  full_name: 'Full name',
  first_name: 'First name',
  middle_name: 'Middle name',
  last_name: 'Last name',
  gender: 'Gender',
  aadhaar_number: 'Aadhaar',
  aadhaar_linked: 'Aadhaar linked',
  dob: 'Date of birth',
  pan_status: 'PAN status',
  pan_allotment_date: 'PAN allotment date',
  mobile: 'Mobile',
  mobile_number: 'Mobile',
  email: 'Email',
  is_salaried: 'Salaried',
  is_director: 'Director',
  is_sole_proprietor: 'Sole proprietor',
  signatory_details: 'Signatory details',
  address: 'Address',
  building_name: 'Building',
  locality: 'Locality',
  street_name: 'Street',
  pincode: 'PIN code',
  city: 'City',
  state: 'State',
  country: 'Country',
  gstin: 'GSTIN',
  reg_no: 'Registration number',
};

export function resultFieldLabel(key: string): string {
  if (KEY_LABELS[key]) return KEY_LABELS[key];
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}
