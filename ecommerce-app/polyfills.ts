// polyfills.ts
import 'react-native-get-random-values';
import { Buffer } from 'buffer';

// Setup global Buffer
if (typeof global.Buffer === 'undefined') {
  global.Buffer = Buffer;
}

// Setup process
if (typeof global.process === 'undefined') {
  global.process = require('process');
} else {
  const bProcess = require('process');
  for (const p in bProcess) {
    if (!(p in global.process)) {
      (global.process as any)[p] = (bProcess as any)[p];
    }
  }
}

global.process.browser = false;

// Setup crypto
if (typeof global.crypto === 'undefined') {
  (global as any).crypto = {
    getRandomValues: (arr: Uint8Array) => {
      const crypto = require('react-native-get-random-values');
      return crypto.getRandomValues(arr);
    }
  };
}

console.log('✅ Polyfills loaded successfully');