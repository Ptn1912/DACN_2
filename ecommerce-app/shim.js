
import 'react-native-get-random-values';

// Buffer polyfill
global.Buffer = require('buffer').Buffer;

// Process polyfill
if (typeof global.process === 'undefined') {
  global.process = require('process');
} else {
  const bProcess = require('process');
  for (var p in bProcess) {
    if (!(p in global.process)) {
      global.process[p] = bProcess[p];
    }
  }
}

global.process.browser = false;
if (typeof global.process.version === 'undefined') {
  global.process.version = 'v16.0.0';
}
if (typeof global.process.versions === 'undefined') {
  global.process.versions = {};
}

