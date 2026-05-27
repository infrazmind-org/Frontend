/**
 * Structured search inputs for products that used to be "pipe in one textarea".
 * Used by admin API test and (mirrored) dashboard single search.
 */

export type SearchFieldDef = {
  id: string;
  label: string;
  required: boolean;
  placeholder?: string;
  inputType?: 'text' | 'tel' | 'email';
};

const _PAN = /^[A-Z]{5}[0-9]{4}[A-Z]$/i;
const _GSTIN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/i;
const _MOB = /^[6-9]\d{9}$/;

function stripMobile(raw: string): string {
  let d = raw.replace(/\D/g, '');
  if (d.length === 11 && d.startsWith('91')) d = d.slice(2);
  if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
  return d;
}

/** When non-null, render labeled inputs instead of a freeform value textarea. */
export function getSearchFormFields(slug: string, searchType: string): SearchFieldDef[] | null {
  const s = (slug || '').trim();
  switch (s) {
    case 'arm_credit_suite':
      return [
        { id: 'name', label: 'Full name', required: true, placeholder: 'As on bank / KYC', inputType: 'text' },
        { id: 'mobile', label: 'Mobile', required: true, placeholder: '10-digit Indian mobile', inputType: 'tel' },
        { id: 'email', label: 'Email', required: true, placeholder: 'you@example.com', inputType: 'email' },
        { id: 'pan', label: 'PAN', required: false, placeholder: 'Optional — AAAAA9999A', inputType: 'text' },
        { id: 'dob', label: 'Date of birth', required: false, placeholder: 'Optional — yyyy-mm-dd', inputType: 'text' },
      ];
    case 'epfo_employment':
      return [
        { id: 'employee_name', label: 'Employee name', required: true, placeholder: 'Full name', inputType: 'text' },
        { id: 'employer_name', label: 'Employer name', required: true, placeholder: 'Company name', inputType: 'text' },
      ];
    case 'ecomm_analytics_v2':
      return [
        { id: 'website_id', label: 'Website ID', required: true, placeholder: 'Your assigned website ID', inputType: 'text' },
        { id: 'username', label: 'Username', required: true, placeholder: 'Often mobile or login id', inputType: 'text' },
      ];
    case 'skip_tracing':
      return [
        {
          id: 'identifier',
          label: searchType === 'Mobile' ? 'Mobile number' : 'PAN',
          required: true,
          placeholder: searchType === 'Mobile' ? '10-digit mobile' : 'AAAAA9999A',
          inputType: searchType === 'Mobile' ? 'tel' : 'text',
        },
        { id: 'extra_name', label: 'Name (optional)', required: false, placeholder: 'For name matching', inputType: 'text' },
      ];
    case 'mobile_to_address':
      return [{ id: 'mobile', label: 'Mobile number', required: true, placeholder: '10-digit Indian mobile', inputType: 'tel' }];
    case 'gst_advanced':
    case 'contact_to_gst':
      return [{ id: 'gstin', label: 'GSTIN', required: true, placeholder: '15-character GSTIN', inputType: 'text' }];
    case 'itr_consent_flow':
      return [{ id: 'pan', label: 'PAN', required: true, placeholder: 'ABCDE1234F', inputType: 'text' }];
    case 'pan_details_plus':
    case 'pan_profile':
    case 'gst_search_by_pan':
    case 'pan_details_v1':
    case 'ckyc_search':
      return [{ id: 'pan', label: 'PAN', required: true, placeholder: 'ABCDE1234F', inputType: 'text' }];
    case 'mobile_to_prefill':
    case 'mobile_to_pan':
      return [{ id: 'mobile', label: 'Mobile number', required: true, placeholder: '10-digit Indian mobile', inputType: 'tel' }];
    case 'rc_advanced_validation':
    case 'vehicle_rc_plus':
    case 'vehicle_echallan':
    case 'vehicle_fastag_toll':
      return [{ id: 'reg_no', label: 'Registration number', required: true, placeholder: 'e.g. KA01AB1234', inputType: 'text' }];
    default:
      return null;
  }
}

export function composeApiValue(
  slug: string,
  searchType: string,
  values: Record<string, string>
): string {
  const s = (slug || '').trim();
  const v = (id: string) => (values[id] ?? '').trim();
  switch (s) {
    case 'arm_credit_suite': {
      const parts = [v('name'), stripMobile(v('mobile')), v('email')].filter(Boolean);
      const pan = v('pan').toUpperCase();
      const dob = v('dob');
      if (pan) parts.push(pan);
      if (dob) parts.push(dob);
      return parts.join('|');
    }
    case 'epfo_employment':
      return `${v('employee_name')}|${v('employer_name')}`;
    case 'ecomm_analytics_v2':
      return `${v('website_id')}|${v('username')}`;
    case 'skip_tracing': {
      const main = searchType === 'Mobile' ? stripMobile(v('identifier')) : v('identifier').toUpperCase();
      const name = v('extra_name');
      return name ? `${main}|${name}` : main;
    }
    case 'mobile_to_address':
      return stripMobile(v('mobile'));
    case 'gst_advanced':
    case 'contact_to_gst':
      return v('gstin').toUpperCase();
    case 'itr_consent_flow':
    case 'pan_details_plus':
    case 'pan_profile':
    case 'gst_search_by_pan':
    case 'pan_details_v1':
    case 'ckyc_search':
      return v('pan').toUpperCase();
    case 'mobile_to_prefill':
    case 'mobile_to_pan':
      return stripMobile(v('mobile'));
    case 'rc_advanced_validation':
    case 'vehicle_rc_plus':
    case 'vehicle_echallan':
    case 'vehicle_fastag_toll':
      return v('reg_no').toUpperCase();
    default:
      return '';
  }
}

export type ValidateSearchFormResult =
  | { ok: true; value: string; fieldErrors?: undefined }
  | { ok: false; message: string; fieldErrors: Record<string, string> };

export function validateSearchForm(
  slug: string,
  searchType: string,
  fields: SearchFieldDef[],
  values: Record<string, string>
): ValidateSearchFormResult {
  const fieldErrors: Record<string, string> = {};
  for (const f of fields) {
    const raw = (values[f.id] ?? '').trim();
    if (f.required && !raw) {
      fieldErrors[f.id] = 'Required';
    }
  }
  if (Object.keys(fieldErrors).length) {
    const first = fields.find((f) => fieldErrors[f.id]);
    return {
      ok: false,
      message: first ? `${first.label} is required.` : 'Please fill required fields.',
      fieldErrors,
    };
  }

  const s = (slug || '').trim();
  const v = (id: string) => (values[id] ?? '').trim();

  if (s === 'arm_credit_suite') {
    const mob = stripMobile(v('mobile'));
    if (!_MOB.test(mob)) fieldErrors.mobile = 'Enter a valid 10-digit Indian mobile.';
    const em = v('email');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) fieldErrors.email = 'Enter a valid email.';
    const pan = v('pan').toUpperCase();
    if (pan && !_PAN.test(pan)) fieldErrors.pan = 'Invalid PAN format.';
    const dob = v('dob');
    if (dob && !/^\d{4}-\d{2}-\d{2}$/.test(dob)) fieldErrors.dob = 'Use yyyy-mm-dd.';
    if (Object.keys(fieldErrors).length) {
      return { ok: false, message: 'Fix the highlighted fields.', fieldErrors };
    }
  }

  if (s === 'skip_tracing') {
    const idv = v('identifier');
    if (searchType === 'Mobile') {
      if (!_MOB.test(stripMobile(idv))) fieldErrors.identifier = 'Enter a valid 10-digit mobile.';
    } else if (!_PAN.test(idv.toUpperCase())) {
      fieldErrors.identifier = 'Enter a valid PAN.';
    }
    if (Object.keys(fieldErrors).length) {
      return { ok: false, message: 'Fix the highlighted fields.', fieldErrors };
    }
  }

  if (s === 'mobile_to_address' || s === 'mobile_to_prefill' || s === 'mobile_to_pan') {
    const mob = stripMobile(v('mobile'));
    if (!_MOB.test(mob)) {
      fieldErrors.mobile = 'Enter a valid 10-digit Indian mobile.';
      return { ok: false, message: 'Invalid mobile.', fieldErrors };
    }
  }

  if (s === 'gst_advanced' || s === 'contact_to_gst') {
    const g = v('gstin').toUpperCase();
    if (!_GSTIN.test(g)) {
      fieldErrors.gstin = 'Enter a valid 15-character GSTIN.';
      return { ok: false, message: 'Invalid GSTIN.', fieldErrors };
    }
  }

  const panSlugs = new Set([
    'itr_consent_flow',
    'pan_details_plus',
    'pan_profile',
    'gst_search_by_pan',
    'pan_details_v1',
    'ckyc_search',
  ]);
  if (panSlugs.has(s)) {
    const p = v('pan').toUpperCase();
    if (!_PAN.test(p)) {
      fieldErrors.pan = 'Enter a valid PAN.';
      return { ok: false, message: 'Invalid PAN.', fieldErrors };
    }
  }

  return { ok: true, value: composeApiValue(slug, searchType, values) };
}
