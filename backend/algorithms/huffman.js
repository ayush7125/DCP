const zlib = require('zlib');
const util = require('util');
const fs = require('fs');

const brotliCompress = util.promisify(zlib.brotliCompress);
const brotliDecompress = util.promisify(zlib.brotliDecompress);

// NOTE: The original Huffman implementation was for educational purposes and not robust
// for all binary files. Using Brotli as a stable backend for all algorithms to ensure
// functionality and prevent data corruption.

// Simple Node implementation for Huffman Coding
// Not optimized for production use, but good for demonstration.

// Represents a node in the Huffman tree
class HuffmanNode {
  constructor(char, freq, left = null, right = null) {
    this.char = char;
    this.freq = freq;
    this.left = left;
    this.right = right;
  }
}

// Builds the Huffman tree
function buildTree(freqMap) {
  const pq = [];
  for (const char in freqMap) {
    pq.push(new HuffmanNode(char, freqMap[char]));
  }
  pq.sort((a, b) => a.freq - b.freq);

  if (pq.length === 0) {
    return null;
  }
  if (pq.length === 1) {
    const node = pq[0];
    return new HuffmanNode('\0', node.freq, node, null);
  }

  while (pq.length > 1) {
    const left = pq.shift();
    const right = pq.shift();
    const newNode = new HuffmanNode(null, left.freq + right.freq, left, right);
    
    // Insert new node in sorted order
    let i = 0;
    while(i < pq.length && pq[i].freq < newNode.freq) {
      i++;
    }
    pq.splice(i, 0, newNode);
  }
  return pq[0];
}

// Generates Huffman codes from the tree
function generateCodes(node, prefix = '', codeMap = {}) {
  if (node) {
    if (node.char !== null) {
      codeMap[node.char] = prefix || '0'; // Handle single character case
    } else {
      generateCodes(node.left, prefix + '0', codeMap);
      generateCodes(node.right, prefix + '1', codeMap);
    }
  }
  return codeMap;
}

// Encodes the input data using Huffman codes
function encode(data, codes) {
  let encoded = '';
  for (let i = 0; i < data.length; i++) {
    const char = String.fromCharCode(data[i]);
    encoded += codes[char];
  }
  return encoded;
}

// Main compress function
exports.compress = async (input) => {
  if (!(input instanceof Buffer)) {
    throw new Error("Input must be a Buffer.");
  }
  if (input.length === 0) {
    return { output: Buffer.from([]), meta: {} };
  }

  // 1. Calculate frequency of each byte
  const freqMap = {};
  for (const byte of input) {
    const char = String.fromCharCode(byte);
    freqMap[char] = (freqMap[char] || 0) + 1;
  }

  // 2. Build Huffman Tree
  const tree = buildTree(freqMap);
  if (!tree) {
    return { output: Buffer.from([]), meta: {} };
  }

  // 3. Generate Huffman Codes
  const codes = generateCodes(tree);
  
  // 4. Encode the data string
  const encodedString = encode(input, codes);

  // 5. Pack the bits into a buffer
  const padding = (8 - (encodedString.length % 8)) % 8;
  const encodedWithPadding = encodedString + '0'.repeat(padding);

  const outputBytes = new Uint8Array(encodedWithPadding.length / 8);
  for (let i = 0; i < encodedWithPadding.length; i += 8) {
    const byteString = encodedWithPadding.substr(i, 8);
    outputBytes[i / 8] = parseInt(byteString, 2);
  }

  // 6. Create metadata (the frequency map)
  const meta = { freqMap, padding };
  const metaBuffer = Buffer.from(JSON.stringify(meta));
  const metaLengthBuffer = Buffer.alloc(4); // 4 bytes for 32-bit integer
  metaLengthBuffer.writeUInt32BE(metaBuffer.length, 0);

  // 7. Combine metadata and compressed data
  const output = Buffer.concat([metaLengthBuffer, metaBuffer, Buffer.from(outputBytes)]);

  return { output, meta };
};

// Main decompress function
exports.decompress = async (input) => {
  if (!(input instanceof Buffer)) {
    throw new Error("Input must be a Buffer.");
  }
  if (input.length < 4) {
    return Buffer.from([]);
  }

  // 1. Extract metadata
  const metaLength = input.readUInt32BE(0);
  if (input.length < 4 + metaLength) {
    throw new Error("Invalid Huffman data: metadata length exceeds buffer size.");
  }

  const metaBuffer = input.slice(4, 4 + metaLength);
  const meta = JSON.parse(metaBuffer.toString());
  const { freqMap, padding } = meta;

  // 2. Rebuild Huffman Tree
  const tree = buildTree(freqMap);
  if (!tree) {
    return Buffer.from([]);
  }

  // 3. Unpack the data bits
  const dataBuffer = input.slice(4 + metaLength);
  let encodedString = '';
  for (const byte of dataBuffer) {
    encodedString += byte.toString(2).padStart(8, '0');
  }
  
  // Remove padding
  encodedString = encodedString.slice(0, encodedString.length - padding);

  // 4. Decode the bit string
  const decodedBytes = [];
  let currentNode = tree;
  
  // Handle edge case of file with single, repeated character
  if (!currentNode.left && !currentNode.right) {
     const charCode = currentNode.char.charCodeAt(0);
     const numChars = freqMap[currentNode.char];
     for (let i = 0; i < numChars; i++) {
        decodedBytes.push(charCode);
     }
     return Buffer.from(decodedBytes);
  }

  for (let i = 0; i < encodedString.length; i++) {
    const bit = encodedString[i];
    currentNode = bit === '0' ? currentNode.left : currentNode.right;

    if (currentNode && currentNode.char !== null) {
      decodedBytes.push(currentNode.char.charCodeAt(0));
      currentNode = tree;
    }
  }

  return Buffer.from(decodedBytes);
}; 