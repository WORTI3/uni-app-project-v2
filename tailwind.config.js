module.exports = {
  content: [
    "./src/views/*.njk",
    "./src/_layouts/*.njk",
    "./src/_layouts/**/*.njk",
  ],
  theme: {
    extend: {
      screens: {
        // => @media (max-width: 639px) { ... }
        'smm': {'max': '639px'},
      },
      colors: {
        "picton-blue": {
          '50': '#f1f9fe',
          '100': '#e2f1fc',
          '200': '#bfe2f8',
          '300': '#87ccf2',
          '400': '#53b7ea',
          '500': '#2098d7',
          '600': '#127ab7',
          '700': '#106194',
          '800': '#11537b',
          '900': '#144666',
        },
      }
    }
  }
}
