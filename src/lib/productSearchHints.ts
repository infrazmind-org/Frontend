/** Short UI hints: product slug → value field placeholder. */
export function valuePlaceholderForProduct(slug: string): string {
  const s = (slug || '').trim();
  const m: Record<string, string> = {
    skip_tracing: 'PAN or 10-digit mobile. Optional name: ABCDE1234F|Ravi Kumar or 9876543210|Ravi Kumar',
    mobile_to_address: '10-digit Indian mobile',
    mobile_to_pan: '10-digit Indian mobile',
    mobile_to_prefill: '10-digit Indian mobile',
    itr_consent_flow: 'PAN only (e.g. ABCDE1234F)',
    gst_advanced: '15-character GSTIN',
    contact_to_gst: '15-character GSTIN',
    epfo_employment: 'Employee full name|Employer company name',
    arm_credit_suite: 'Name|Mobile|Email optional|PAN|DOB (yyyy-mm-dd)',
    ecomm_analytics_v2: 'website_id|username (see Digitap Ecomm doc)',
    vehicle_rc_plus: 'Vehicle registration number (e.g. KA01AB1234)',
    vehicle_echallan: 'Vehicle registration number',
    vehicle_fastag_toll: 'Vehicle registration number',
    rc_advanced_validation: 'Vehicle registration number',
    pan_details_plus: 'PAN (e.g. ABCDE1234F)',
    pan_profile: 'PAN (e.g. ABCDE1234F)',
    gst_search_by_pan: 'PAN (e.g. ABCDE1234F)',
  };
  return m[s] || 'Identifier for the selected product (PAN, mobile, GSTIN, reg no, etc.)';
}

/** Extra sentence under the input-type dropdown for ambiguous products. */
export function typeFieldHintForProduct(slug: string): string | null {
  const s = (slug || '').trim();
  if (s === 'skip_tracing') {
    return 'Choose PAN or Mobile above so the value is validated as that identifier (Digitap requires one or the other).';
  }
  if (s === 'mobile_to_address') {
    return 'This product only accepts a mobile number (same skip-tracing API, mobile branch).';
  }
  if (s === 'itr_consent_flow') {
    return 'Input type is fixed to PAN for the ITR consent URL step.';
  }
  return null;
}
