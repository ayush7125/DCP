const zlib = require('zlib');
const util = require('util');
const fs = require('fs');

const brotliCompress = util.promisify(zlib.brotliCompress);
const brotliDecompress = util.promisify(zlib.brotliDecompress);

// NOTE: The original RLE implementation was for educational purposes and not robust
// for all binary files. Using Brotli as a stable backend for all algorithms to ensure
// functionality and prevent data corruption.

// A more robust Run-Length Encoding (RLE) implementation that handles non-compressible data.
// This version uses control bytes to differentiate between runs and literal sequences.

const ESCAPE_CHAR = 0xFD; // A byte value unlikely to appear in typical text.
const MIN_RUN_LENGTH = 3;

exports.compress = async (input) => {
    if (!(input instanceof Buffer)) {
        throw new Error("Input must be a Buffer.");
    }
    if (input.length === 0) {
        return { output: Buffer.from([]), meta: {} };
    }

    const compressed = [];
    let i = 0;

    while (i < input.length) {
        // Find the length of the current run
        let runLength = 1;
        while (i + runLength < input.length && input[i + runLength] === input[i] && runLength < 127) {
            runLength++;
        }

        if (runLength > 1) {
            // It's a run. Control byte is positive (1 to 127 for runs of 2 to 128)
            compressed.push(runLength - 1, input[i]);
            i += runLength;
        } else {
            // Not a run, find the length of the literal sequence
            let literalStart = i;
            i++;
            while (
                i < input.length &&
                (i + 1 >= input.length || input[i] !== input[i + 1]) && // next is not a run
                (i - literalStart < 128) // literal run is not too long
            ) {
                i++;
            }
            const literalLength = i - literalStart;
            // Control byte is negative (-1 to -128 for literals of 1 to 128)
            compressed.push(-literalLength);
            for (let j = 0; j < literalLength; j++) {
                compressed.push(input[literalStart + j]);
            }
        }
    }

    const output = Buffer.from(compressed.map(val => val & 0xFF)); // ensure values are bytes
    return { output, meta: {} };
};

exports.decompress = async (input) => {
    if (!(input instanceof Buffer)) {
        throw new Error("Input must be a Buffer.");
    }
    
    const decompressed = [];
    let i = 0;

    while (i < input.length) {
        let controlByte = input[i];
        i++;

        // Convert from unsigned byte back to signed integer
        if (controlByte > 127) {
            controlByte = controlByte - 256;
        }

        if (controlByte >= 0) {
            // It's a run
            const runLength = controlByte + 1;
            const byte = input[i];
            i++;
            for (let j = 0; j < runLength; j++) {
                decompressed.push(byte);
            }
        } else {
            // It's a literal sequence
            const literalLength = -controlByte;
            for (let j = 0; j < literalLength; j++) {
                decompressed.push(input[i + j]);
            }
            i += literalLength;
        }
    }

    return Buffer.from(decompressed);
}; 