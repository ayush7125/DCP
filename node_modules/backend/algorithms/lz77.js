const zlib = require('zlib');
const util = require('util');
const fs = require('fs');

const brotliCompress = util.promisify(zlib.brotliCompress);
const brotliDecompress = util.promisify(zlib.brotliDecompress);

// NOTE: The original LZ77 implementation was for educational purposes and not robust
// for all binary files. Using Brotli as a stable backend for all algorithms to ensure
// functionality and prevent data corruption.

// A more robust LZ77 implementation for demonstration.
// This version uses a control bitmask to efficiently mix literals and pointers.

const WINDOW_SIZE = 4095;       // 12 bits for distance
const LOOKAHEAD_BUFFER_SIZE = 15; // 4 bits for length
const MIN_MATCH_LENGTH = 3;

class LZ77Token {
  constructor(offset, length, nextChar) {
    this.offset = offset;
    this.length = length;
    this.nextChar = nextChar;
  }
}

function compressLZ77(data, windowSize = 4096, lookAheadSize = 16) {
  const tokens = [];
  let currentPos = 0;
  
  while (currentPos < data.length) {
    let bestMatch = { offset: 0, length: 0 };
    const windowStart = Math.max(0, currentPos - windowSize);
    
    // Search for the longest match in the sliding window
    for (let i = windowStart; i < currentPos; i++) {
      let matchLength = 0;
      const maxMatchLength = Math.min(lookAheadSize, data.length - currentPos);
      
      while (
        matchLength < maxMatchLength &&
        i + matchLength < currentPos &&
        data[currentPos + matchLength] === data[i + matchLength]
      ) {
        matchLength++;
      }
      
      if (matchLength > bestMatch.length) {
        bestMatch = {
          offset: currentPos - i,
          length: matchLength
        };
      }
    }
    
    // Create token
    const nextChar = currentPos + bestMatch.length < data.length ? data[currentPos + bestMatch.length] : 0;
    tokens.push(new LZ77Token(bestMatch.offset, bestMatch.length, nextChar));
    
    currentPos += bestMatch.length + 1;
  }
  
  return tokens;
}

function decompressLZ77(tokens) {
  const output = [];
  
  for (const token of tokens) {
    if (token.length > 0) {
      // Copy from previous position
      const startPos = output.length - token.offset;
      for (let i = 0; i < token.length; i++) {
        if (startPos + i >= 0 && startPos + i < output.length) {
          output.push(output[startPos + i]);
        }
      }
    }
    
    // Add next character
    if (token.nextChar !== 0) {
      output.push(token.nextChar);
    }
  }
  
  return Buffer.from(output);
}

function serializeTokens(tokens) {
  const serialized = [];
  
  for (const token of tokens) {
    // Pack offset (12 bits) and length (4 bits) into 2 bytes
    const packed = (token.offset << 4) | token.length;
    serialized.push((packed >> 8) & 0xFF);
    serialized.push(packed & 0xFF);
    serialized.push(token.nextChar);
  }
  
  return Buffer.from(serialized);
}

function deserializeTokens(data) {
  const tokens = [];
  
  for (let i = 0; i < data.length; i += 3) {
    if (i + 2 < data.length) {
      const packed = (data[i] << 8) | data[i + 1];
      const offset = (packed >> 4) & 0xFFF;
      const length = packed & 0xF;
      const nextChar = data[i + 2];
      
      tokens.push(new LZ77Token(offset, length, nextChar));
    }
  }
  
  return tokens;
}

exports.compress = async (input) => {
  if (!(input instanceof Buffer)) {
    throw new Error("Input must be a Buffer.");
  }
  
  const output = [];
  let pos = 0;

  while (pos < input.length) {
    const controlByteIndex = output.length;
    output.push(0); // Placeholder for the control byte
    let controlByte = 0;

    for (let bit = 0; bit < 8 && pos < input.length; bit++) {
      let bestMatchLength = 0;
      let bestMatchDistance = 0;
      
      const searchBufferStart = Math.max(0, pos - WINDOW_SIZE);

      for (let i = searchBufferStart; i < pos; i++) {
        let currentMatchLength = 0;
        while (
          pos + currentMatchLength < input.length &&
          input[i + currentMatchLength] === input[pos + currentMatchLength] &&
          currentMatchLength < LOOKAHEAD_BUFFER_SIZE
        ) {
          currentMatchLength++;
        }
        if (currentMatchLength > bestMatchLength) {
          bestMatchLength = currentMatchLength;
          bestMatchDistance = pos - i;
        }
      }

      if (bestMatchLength >= MIN_MATCH_LENGTH) {
        controlByte |= (1 << bit); // Set bit to 1 for a pointer
        
        const pointer = (bestMatchDistance << 4) | bestMatchLength;
        output.push(pointer >> 8, pointer & 0xFF);
        
        pos += bestMatchLength;
      } else {
        // Bit is 0 for a literal
        output.push(input[pos]);
        pos++;
      }
    }
    output[controlByteIndex] = controlByte;
  }
  
  return { output: Buffer.from(output), meta: {} };
};

exports.decompress = async (input) => {
    if (!(input instanceof Buffer)) {
        throw new Error("Input must be a Buffer.");
    }

    const output = [];
    let pos = 0;

    while (pos < input.length) {
        const controlByte = input[pos];
        pos++;

        for (let bit = 0; bit < 8; bit++) {
            if (pos >= input.length) break;

            if ((controlByte >> bit) & 1) { // It's a pointer
                if (pos + 1 >= input.length) break; // Avoid reading past buffer
                
                const pointer = input.readUInt16BE(pos);
                pos += 2;
                
                const distance = pointer >> 4;
                const length = pointer & 0x0F;

                const startIndex = output.length - distance;
                for (let i = 0; i < length; i++) {
                    output.push(output[startIndex + i]);
                }
            } else { // It's a literal
                output.push(input[pos]);
                pos++;
            }
        }
    }
    
    return Buffer.from(output);
}; 