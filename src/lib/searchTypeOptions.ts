/**
 * Customer UI: drop redundant "Auto" when a product also allows explicit types (PAN, Mobile, …).
 * Prefer PAN as the default when available.
 */
export function refineSearchTypeOptions(allowed: string[]): {
  options: string[];
  defaultType: string;
  showTypeSelector: boolean;
} {
  if (!allowed.length) {
    return { options: ['Auto'], defaultType: 'Auto', showTypeSelector: false };
  }

  const withoutAuto = allowed.filter((t) => t !== 'Auto');

  if (withoutAuto.length === 0) {
    return { options: allowed, defaultType: allowed[0]!, showTypeSelector: false };
  }

  if (withoutAuto.length === allowed.length) {
    const defaultType = withoutAuto.includes('PAN') ? 'PAN' : withoutAuto[0]!;
    return {
      options: withoutAuto,
      defaultType,
      showTypeSelector: withoutAuto.length > 1,
    };
  }

  const options = withoutAuto;
  const defaultType = options.includes('PAN') ? 'PAN' : options[0]!;
  return {
    options,
    defaultType,
    showTypeSelector: options.length > 1,
  };
}
