// Polyfill browser globals that modern packages (e.g. pdf-parse v2) expect in Node/Serverless runtimes
if (typeof global.DOMMatrix === 'undefined') {
  global.DOMMatrix = class DOMMatrix {
    constructor() {
      this.a = 1; this.b = 0; this.c = 0; this.d = 1; this.e = 0; this.f = 0;
      this.m11 = 1; this.m12 = 0; this.m13 = 0; this.m14 = 0;
      this.m21 = 0; this.m22 = 1; this.m23 = 0; this.m24 = 0;
      this.m31 = 0; this.m32 = 0; this.m33 = 1; this.m34 = 0;
      this.m41 = 0; this.m42 = 0; this.m43 = 0; this.m44 = 1;
      this.is2D = true;
      this.isIdentity = true;
    }
  };
}
if (typeof global.ImageData === 'undefined') {
  global.ImageData = class ImageData {
    constructor(width, height) {
      this.width = width || 0;
      this.height = height || 0;
      this.data = new Uint8ClampedArray((this.width * this.height) * 4);
    }
  };
}
if (typeof global.Path2D === 'undefined') {
  global.Path2D = class Path2D {
    constructor() {}
  };
}

const app = require('../src/server.js');

module.exports = app;

