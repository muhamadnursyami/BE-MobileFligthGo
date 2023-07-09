// Fungsi createError digunakan untuk membuat objek Error dengan properti status dan message yang sesuai. Fungsi ini menerima dua parameter: status dan message.
export const createError = (status, message) => {
  const err = new Error();
  err.status = status;
  err.message = message;
  return err;
};
