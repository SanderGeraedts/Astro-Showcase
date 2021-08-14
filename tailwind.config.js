module.exports = {
  mode: "jit",
  purge: ["./public/**/*.html", "./src/**/*.{astro,js,jsx,svelte,ts,tsx,vue}"],
  // more options here
  theme: {
    fontFamily: {
      sans: ["Poppins", "sans-serif"],
    },
    spacing: {
      1: "0.5rem",
      2: "1.0rem",
      3: "1.5rem",
      4: "2.0rem",
      5: "2.5rem",
      6: "3.0rem",
      7: "3.5rem",
      8: "4.0rem",
      9: "4.5rem",
      10: "5.0rem",
    },
  },
};
