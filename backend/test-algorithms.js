const fs = require('fs');
const path = require('path');
const huffman = require('./algorithms/huffman');
const rle = require('./algorithms/rle');
const lz77 = require('./algorithms/lz77');
const lzw = require('./algorithms/lzw');
const brotli = require('./algorithms/brotli');

// Test data
const testText = "This is a test string with repeated characters like aaaa and bbbb and cccc. " +
                "It contains some patterns that should be compressible by various algorithms. " +
                "Let's see how well each algorithm performs on this text data.";

const testBinary = Buffer.from([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F]);

const algorithms = [
  { name: 'Huffman', module: huffman },
  { name: 'RLE', module: rle },
  { name: 'LZ77', module: lz77 },
  { name: 'LZW', module: lzw },
  { name: 'Brotli', module: brotli }
];

async function testAlgorithm(algorithm, data, dataType) {
  console.log(`\n=== Testing ${algorithm.name} with ${dataType} data ===`);
  
  try {
    // Compress
    console.log(`Original size: ${data.length} bytes`);
    const startTime = Date.now();
    const { output, meta } = await algorithm.module.compress(data);
    const compressTime = Date.now() - startTime;
    
    console.log(`Compressed size: ${output.length} bytes`);
    console.log(`Compression ratio: ${((1 - output.length / data.length) * 100).toFixed(2)}%`);
    console.log(`Compression time: ${compressTime}ms`);
    
    // Decompress
    const decompressStart = Date.now();
    const decompressed = await algorithm.module.decompress(output);
    const decompressTime = Date.now() - decompressStart;
    
    console.log(`Decompressed size: ${decompressed.length} bytes`);
    console.log(`Decompression time: ${decompressTime}ms`);
    
    // Verify integrity
    const isCorrect = data.equals(decompressed);
    console.log(`Data integrity: ${isCorrect ? '✓ PASS' : '✗ FAIL'}`);
    
    if (!isCorrect) {
      console.log('Original:', data);
      console.log('Decompressed:', decompressed);
    }
    
    return {
      algorithm: algorithm.name,
      dataType,
      originalSize: data.length,
      compressedSize: output.length,
      compressionRatio: ((1 - output.length / data.length) * 100).toFixed(2),
      compressTime,
      decompressTime,
      integrity: isCorrect
    };
    
  } catch (error) {
    console.error(`Error testing ${algorithm.name}:`, error.message);
    return {
      algorithm: algorithm.name,
      dataType,
      error: error.message
    };
  }
}

async function runTests() {
  console.log('Starting compression algorithm tests...\n');
  
  const results = [];
  
  // Test with text data
  const textBuffer = Buffer.from(testText, 'utf8');
  for (const algorithm of algorithms) {
    const result = await testAlgorithm(algorithm, textBuffer, 'text');
    results.push(result);
  }
  
  // Test with binary data
  for (const algorithm of algorithms) {
    const result = await testAlgorithm(algorithm, testBinary, 'binary');
    results.push(result);
  }
  
  // Summary
  console.log('\n=== TEST SUMMARY ===');
  console.table(results);
  
  // Check for failures
  const failures = results.filter(r => r.error || (r.integrity === false));
  if (failures.length > 0) {
    console.log('\n❌ Some tests failed:');
    failures.forEach(f => {
      console.log(`- ${f.algorithm} (${f.dataType}): ${f.error || 'Data integrity failed'}`);
    });
  } else {
    console.log('\n✅ All tests passed!');
  }
}

// Run tests
runTests().catch(console.error); 