export default (url) => {
  console.log({ url });
  if (!url) {
    return url;
  }

  return url.startsWith("http") ? url : `https://${url}`;
};
