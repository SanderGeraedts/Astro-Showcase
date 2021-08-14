export default (url) => {
  if (!url) {
    return url;
  }

  return url.startsWith("http") ? url : `https://${url}`;
};
