/**
 * Replaces placeholders in a URL path with provided parameters.
 * Placeholders are defined using the {{key}} syntax.
 *
 * @param path - The API endpoint path with optional placeholders
 * @param params - An object containing key-value pairs to replace placeholders
 * @returns The formatted URL string
 *
 * @example
 * formatUrl('/users/{{id}}', { id: '123' }) // returns '/users/123'
 */
export const formatUrl = (
  path: string,
  params: Record<string, string | number>,
): string => {
  let url = path;
  Object.entries(params).forEach(([key, value]) => {
    url = url.replace(`{{${key}}}`, encodeURIComponent(value.toString()));
  });
  return url;
};
