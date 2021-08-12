module.exports = {
  mode: "jit",
  purge: ["./public/**/*.html", "./src/**/*.{astro,js,jsx,svelte,ts,tsx,vue}"],
  // more options here
  theme: {
    fontFamily: {
      sans: ["Poppins", "sans-serif"],
    },
  },
};
