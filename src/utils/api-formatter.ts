/**
 * Replaces placeholders in a URL path with provided parameters.
 * Placeholders are defined using the {{key}} syntax.
 * Any parameters not used for path replacement are appended as query string.
 *
 * @param path - The API endpoint path with optional placeholders
 * @param params - An object containing key-value pairs to replace placeholders or append as query
 * @returns The formatted URL string
 *
 * @example
 * formatUrl('/users/{{id}}', { id: '123', sort: 'desc' }) // returns '/users/123?sort=desc'
 */
export const formatUrl = (
  path: string,
  params: Record<string, any> = {},
): string => {
  let url = path;
  const queryParams: Record<string, any> = {};

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    const placeholder = `{{${key}}}`;
    if (url.includes(placeholder)) {
      url = url.replace(placeholder, encodeURIComponent(String(value)));
    } else {
      queryParams[key] = value;
    }
  });

  const queryString = new URLSearchParams(
    Object.entries(queryParams).map(([k, v]) => [k, String(v)]),
  ).toString();

  if (queryString) {
    url += (url.includes('?') ? '&' : '?') + queryString;
  }

  return url;
};
