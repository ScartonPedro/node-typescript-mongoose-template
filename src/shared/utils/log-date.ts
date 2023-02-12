/**
 * Returns current date formatted for the console
 *
 * @returns Example: [30-01-2021 - 00:00:00:000]
 */
export const logDate = () => {
  return `[${dateAndTime()}]`;
};

/**
 * Returns current date and time (with seconds) formatted with the desired locale
 *
 * @returns Example 30-01-2021 - 00:00:00
 */
export const dateAndTime = (locale = 'es-CL') => {
  const date = new Date();
  return `${date.toISOString().split('T')[0]} ${date.toLocaleTimeString(
    locale
  )}`;
};
