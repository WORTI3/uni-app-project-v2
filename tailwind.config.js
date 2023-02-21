module.exports = {
  content: [
    "./src/views/*.njk",
    "./src/_layouts/*.njk",
    "./src/_layouts/**/*.njk",
  ],
  theme: {
    extend: {
      screens: {
        // => @media (max-width: 767px) { ... }
        'smm': {'max': '639px'},
      }
    }
  }
}
