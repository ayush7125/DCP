const zlib = require('zlib');
const util = require('util');

// Promisify the zlib functions to use them with async/await
const brotliCompress = util.promisify(zlib.brotliCompress);
const brotliDecompress = util.promisify(zlib.brotliDecompress);

/**
 * Compresses the input buffer using the Brotli algorithm.
 * To ensure stability and prevent data corruption, all compression
 * operations now use the native Brotli implementation.
 * @param {Buffer} input The buffer to compress.
 * @returns {Promise<{output: Buffer, meta: object}>} The compressed buffer and a minimal meta object.
 */
exports.compress = async (input) => {
  try {
    const compressedData = await brotliCompress(input);
    
    // Prepare metadata
    const metadata = {
      algorithm: 'brotli',
      originalSize: input.length,
      compressedSize: compressedData.length,
      quality: 11,
      lgwin: 24
    };
    
    // Create compressed data structure
    const compressedOutput = {
      metadata: JSON.stringify(metadata),
      data: compressedData
    };
    
    // Combine metadata and data
    const metadataBuffer = Buffer.from(compressedOutput.metadata, 'utf8');
    const metadataLength = Buffer.alloc(4);
    metadataLength.writeUInt32BE(metadataBuffer.length, 0);
    
    const output = Buffer.concat([metadataLength, metadataBuffer, compressedOutput.data]);
    
    return {
      output,
      meta: metadata
    };
  } catch (error) {
    throw new Error(`Brotli compression failed: ${error.message}`);
  }
};

/**
 * Decompresses the input buffer using the Brotli algorithm.
 * @param {Buffer} input The buffer to decompress.
 * @param {object} meta Metadata from the compression step (not used by Brotli).
 * @returns {Promise<Buffer>} The decompressed buffer.
 */
exports.decompress = async (input, meta) => {
  try {
    // Extract metadata length
    const metadataLength = input.readUInt32BE(0);
    
    // Extract metadata
    const metadataBuffer = input.slice(4, 4 + metadataLength);
    const metadata = JSON.parse(metadataBuffer.toString('utf8'));
    
    // Extract compressed data
    const compressedData = input.slice(4 + metadataLength);
    
    // Decompress data
    const output = await brotliDecompress(compressedData);
    
    return output;
  } catch (error) {
    throw new Error(`Brotli decompression failed: ${error.message}`);
  }
}; 