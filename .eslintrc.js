module.exports = {
  'env': {
    'browser': true,
    'es6': true,
  },
  'extends': [
    'google',
  ],
  'globals': {
    'Atomics': 'readonly',
    'SharedArrayBuffer': 'readonly',
  },
  'parserOptions': {
    'ecmaVersion': 2018,
    'sourceType': 'module',
  },
  'rules': {
    "linebreak-style": ["error", (process.platform === "win32" ? "windows" : "unix")],
    "indent": ["error", 4],
    "max-len": [2, {"code": 120, "tabWidth": 4, "ignoreUrls": true}]
  },
};
