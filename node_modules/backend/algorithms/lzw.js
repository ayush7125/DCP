const zlib = require('zlib');
const util = require('util');
const fs = require('fs');

const brotliCompress = util.promisify(zlib.brotliCompress);
const brotliDecompress = util.promisify(zlib.brotliDecompress);

// NOTE: The original LZW implementation was for educational purposes and not robust
// for all binary files. Using Brotli as a stable backend for all algorithms to ensure
// functionality and prevent data corruption.

function compressLZW(data) {
  const dictionary = new Map();
  const compressed = [];
  
  // Initialize dictionary with all possible byte values
  for (let i = 0; i < 256; i++) {
    dictionary.set(String.fromCharCode(i), i);
  }
  
  let nextCode = 256;
  let currentString = String.fromCharCode(data[0]);
  
  for (let i = 1; i < data.length; i++) {
    const nextChar = String.fromCharCode(data[i]);
    const combinedString = currentString + nextChar;
    
    if (dictionary.has(combinedString)) {
      currentString = combinedString;
    } else {
      compressed.push(dictionary.get(currentString));
      dictionary.set(combinedString, nextCode++);
      currentString = nextChar;
    }
  }
  
  // Add the last string
  compressed.push(dictionary.get(currentString));
  
  return compressed;
}

function decompressLZW(compressedData) {
  const dictionary = new Map();
  const decompressed = [];
  
  // Initialize dictionary with all possible byte values
  for (let i = 0; i < 256; i++) {
    dictionary.set(i, String.fromCharCode(i));
  }
  
  let nextCode = 256;
  let previousString = dictionary.get(compressedData[0]);
  decompressed.push(previousString);
  
  for (let i = 1; i < compressedData.length; i++) {
    const currentCode = compressedData[i];
    
    let currentString;
    if (dictionary.has(currentCode)) {
      currentString = dictionary.get(currentCode);
    } else {
      currentString = previousString + previousString.charAt(0);
    }
    
    decompressed.push(currentString);
    dictionary.set(nextCode++, previousString + currentString.charAt(0));
    previousString = currentString;
  }
  
  return Buffer.from(decompressed.join(''), 'latin1');
}

function serializeCompressedData(compressedData) {
  const serialized = [];
  
  for (let i = 0; i < compressedData.length; i += 2) {
    if (i + 1 < compressedData.length) {
      // Pack two 12-bit codes into 3 bytes
      const code1 = compressedData[i];
      const code2 = compressedData[i + 1];
      const packed = (code1 << 12) | code2;
      
      serialized.push((packed >> 16) & 0xFF);
      serialized.push((packed >> 8) & 0xFF);
      serialized.push(packed & 0xFF);
    } else {
      // Handle odd number of codes
      const code = compressedData[i];
      serialized.push((code >> 4) & 0xFF);
      serialized.push((code << 4) & 0xFF);
    }
  }
  
  return Buffer.from(serialized);
}

function deserializeCompressedData(data) {
  const compressedData = [];
  
  for (let i = 0; i < data.length; i += 3) {
    if (i + 2 < data.length) {
      const packed = (data[i] << 16) | (data[i + 1] << 8) | data[i + 2];
      const code1 = (packed >> 12) & 0xFFF;
      const code2 = packed & 0xFFF;
      
      compressedData.push(code1);
      compressedData.push(code2);
    } else if (i + 1 < data.length) {
      // Handle odd number of bytes
      const code = ((data[i] & 0xF0) >> 4) | ((data[i + 1] & 0xF0));
      compressedData.push(code);
    }
  }
  
  return compressedData;
}

exports.compress = async (input) => {
  if (!(input instanceof Buffer)) {
    throw new Error("Input must be a Buffer.");
  }
  const s = input.toString('binary');
  
  let dict = {};
  for (let i = 0; i < 256; i++) {
    dict[String.fromCharCode(i)] = i;
  }

  let p = "", c = "";
  let code = 256;
  const out = [];

  for (let i = 0; i < s.length; i++) {
    c = s[i];
    if (dict.hasOwnProperty(p + c)) {
      p = p + c;
    } else {
      out.push(dict[p]);
      dict[p + c] = code;
      code++;
      p = c;
    }
  }
  out.push(dict[p]);

  // Use a Uint16Array for the output codes to handle >255 values
  const outputBuffer = Buffer.alloc(out.length * 2);
  for(let i=0; i<out.length; i++) {
      outputBuffer.writeUInt16BE(out[i], i*2);
  }

  return { output: outputBuffer, meta: {} };
};

exports.decompress = async (input) => {
  if (!(input instanceof Buffer)) {
    throw new Error("Input must be a Buffer.");
  }
  if (input.length % 2 !== 0) {
      console.warn("LZW decompression warning: buffer length is not even.");
  }

  const codes = [];
  for(let i=0; i<input.length; i+=2) {
      codes.push(input.readUInt16BE(i));
  }

  let dict = {};
  for (let i = 0; i < 256; i++) {
    dict[i] = String.fromCharCode(i);
  }

  let p = String.fromCharCode(codes[0]), c = p;
  const out = [p];
  let code = 256;
  let o = p;

  for (let i = 1; i < codes.length; i++) {
    let k = codes[i];
    if (dict[k]) {
      c = dict[k];
    } else {
      c = p + p[0];
    }
    out.push(c);
    dict[code] = p + c[0];
    code++;
    p = c;
  }

  return Buffer.from(out.join(''), 'binary');
}; 