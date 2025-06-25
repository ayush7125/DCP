const fs = require('fs');
const path = require('path');
const huffman = require('../algorithms/huffman');
const rle = require('../algorithms/rle');
const lz77 = require('../algorithms/lz77');
const lzw = require('../algorithms/lzw');
const brotli = require('../algorithms/brotli');
const History = require('../models/History');

// Supported file types for compression
const supportedMimeTypes = [
  'text/plain', 'text/html', 'text/css', 'text/javascript', 'application/json',
  'application/pdf', 'image/png', 'image/jpeg', 'image/gif', 'image/bmp', 'image/webp',
  'application/zip', 'application/x-zip-compressed', 'application/octet-stream',
  'application/xml', 'text/xml', 'application/javascript', 'text/csv'
];

function getAlgorithm(name) {
  switch (name.toLowerCase()) {
    case 'huffman': return huffman;
    case 'rle': return rle;
    case 'lz77': return lz77;
    case 'lzw': return lzw;
    case 'brotli': return brotli;
    default: throw new Error(`Unsupported algorithm: ${name}`);
  }
}

function getFileExtension(filename) {
  return path.extname(filename) || '';
}

function generateOutputFilename(originalName, algorithm, operation) {
  if (operation === 'compress') {
    // e.g., "my_image.jpg" -> "my_image.jpg.brotli"
    return `${originalName}.${algorithm}`;
  } else { // decompress
    let restoredName = originalName;
    // If the uploaded file for decompression ends with the algorithm's name, strip it off.
    // e.g., "my_image.jpg.brotli" -> "my_image.jpg"
    if (restoredName.endsWith(`.${algorithm}`)) {
      restoredName = restoredName.slice(0, -(`.${algorithm}`.length));
    }
    // Returns "decompressed_my_image.jpg"
    return `decompressed_${restoredName}`;
  }
}

exports.getAlgorithms = (req, res) => {
  try {
    const algorithms = [
      { 
        name: 'huffman', 
        label: 'Huffman Coding', 
        description: 'Optimal prefix coding for lossless compression. Best for text files with repeated characters.',
        icon: 'Cpu',
        bestFor: ['text', 'documents'],
        compressionRatio: 'High'
      },
      { 
        name: 'rle', 
        label: 'Run-Length Encoding', 
        description: 'Simple compression for data with repeated values. Good for images with large uniform areas.',
        icon: 'ArrowRight',
        bestFor: ['images', 'simple data'],
        compressionRatio: 'Low to Medium'
      },
      { 
        name: 'lz77', 
        label: 'LZ77', 
        description: 'Sliding window-based compression algorithm. Good for general-purpose compression.',
        icon: 'Cpu',
        bestFor: ['general', 'text', 'binary'],
        compressionRatio: 'Medium to High'
      },
      { 
        name: 'lzw', 
        label: 'LZW', 
        description: 'Dictionary-based compression ideal for text and repetitive data.',
        icon: 'Cpu',
        bestFor: ['text', 'documents'],
        compressionRatio: 'Medium to High'
      },
      { 
        name: 'brotli', 
        label: 'Brotli', 
        description: 'A modern, high-performance compression algorithm. Excellent for web content.',
        icon: 'Cpu',
        bestFor: ['web content', 'general'],
        compressionRatio: 'Very High'
      },
    ];
    res.json(algorithms);
  } catch (error) {
    console.error('Error getting algorithms:', error);
    res.status(500).json({ error: 'Failed to get algorithms' });
  }
};

exports.compress = async (req, res) => {
  try {
    const { algorithm } = req.body;
    const file = req.file;

    // Validation
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!algorithm) {
      return res.status(400).json({ error: 'Algorithm not specified' });
    }

    if (!supportedMimeTypes.includes(file.mimetype)) {
      console.warn(`Unsupported file type: ${file.mimetype} for file: ${file.originalname}`);
    }

    // Get algorithm implementation
    let algo;
    try {
      algo = getAlgorithm(algorithm);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }

    // Read input file
    const inputPath = file.path;
    const inputData = fs.readFileSync(inputPath);
    
    if (inputData.length === 0) {
      return res.status(400).json({ error: 'File is empty' });
    }

    // Compress the data
    const startTime = Date.now();
    const { output, meta } = await algo.compress(inputData);
    const endTime = Date.now();

    // Generate output filename
    const outputFilename = generateOutputFilename(file.originalname, algorithm, 'compress');
    const outputPath = path.join('uploads', outputFilename);

    // Write compressed file
    fs.writeFileSync(outputPath, output);

    // Calculate statistics
    const stats = {
      originalSize: inputData.length,
      compressedSize: output.length,
      compressionRatio: ((1 - output.length / inputData.length) * 100).toFixed(2),
      spaceSaved: (inputData.length - output.length).toFixed(2),
      processingTime: endTime - startTime,
      algorithm: algorithm,
      originalFilename: file.originalname,
      compressedFilename: outputFilename
    };

    // Save to history if user is authenticated
    if (req.user) {
      try {
        const historyEntry = {
          _id: Date.now().toString(), // Simple ID for in-memory storage
          user: req.user.id,
          operation: 'compress',
          algorithm: algorithm,
          originalFilename: file.originalname,
          processedFilename: outputFilename,
          originalSize: inputData.length,
          processedSize: output.length,
          compressionRatio: stats.compressionRatio,
          processingTime: stats.processingTime,
          stats: stats,
          meta: meta,
          createdAt: new Date()
        };
        
        // Add to in-memory history
        if (global.inMemoryHistory) {
          global.inMemoryHistory.push(historyEntry);
        }
      } catch (historyError) {
        console.warn('Failed to save history:', historyError.message);
        // Don't fail the operation if history saving fails
      }
    }

    // Clean up input file
    try {
      fs.unlinkSync(inputPath);
    } catch (err) {
      console.warn('Failed to clean up input file:', err.message);
    }

    res.json({
      success: true,
      message: 'File compressed successfully',
      stats,
      downloadUrl: `/api/download/${outputFilename}`,
      meta
    });

  } catch (error) {
    console.error('Compression error:', error);
    
    // Clean up files on error
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.warn('Failed to clean up file on error:', err.message);
      }
    }

    res.status(500).json({ 
      error: 'Compression failed', 
      message: error.message 
    });
  }
};

exports.decompress = async (req, res) => {
  try {
    const { algorithm, originalFilename } = req.body;
    const file = req.file;

    // Validation
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!algorithm) {
      return res.status(400).json({ error: 'Algorithm not specified' });
    }

    // Get algorithm implementation
    let algo;
    try {
      algo = getAlgorithm(algorithm);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }

    // Read input file
    const inputPath = file.path;
    const inputData = fs.readFileSync(inputPath);
    
    if (inputData.length === 0) {
      return res.status(400).json({ error: 'File is empty' });
    }

    // Decompress the data
    const startTime = Date.now();
    const output = await algo.decompress(inputData);
    const endTime = Date.now();

    // Generate output filename
    const outputFilename = generateOutputFilename(
      originalFilename || file.originalname, 
      algorithm, 
      'decompress'
    );
    const outputPath = path.join('uploads', outputFilename);

    // Write decompressed file
    fs.writeFileSync(outputPath, output);

    // Calculate statistics
    const stats = {
      compressedSize: inputData.length,
      decompressedSize: output.length,
      processingTime: endTime - startTime,
      algorithm: algorithm,
      originalFilename: file.originalname,
      decompressedFilename: outputFilename
    };

    // Save to history if user is authenticated
    if (req.user) {
      try {
        const historyEntry = {
          _id: Date.now().toString(), // Simple ID for in-memory storage
          user: req.user.id,
          operation: 'decompress',
          algorithm: algorithm,
          originalFilename: file.originalname,
          processedFilename: outputFilename,
          originalSize: inputData.length,
          processedSize: output.length,
          processingTime: stats.processingTime,
          stats: stats,
          createdAt: new Date()
        };
        
        // Add to in-memory history
        if (global.inMemoryHistory) {
          global.inMemoryHistory.push(historyEntry);
        }
      } catch (historyError) {
        console.warn('Failed to save history:', historyError.message);
        // Don't fail the operation if history saving fails
      }
    }

    // Clean up input file
    try {
      fs.unlinkSync(inputPath);
    } catch (err) {
      console.warn('Failed to clean up input file:', err.message);
    }

    res.json({
      success: true,
      message: 'File decompressed successfully',
      stats,
      downloadUrl: `/api/download/${outputFilename}`
    });

  } catch (error) {
    console.error('Decompression error:', error);
    
    // Clean up files on error
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.warn('Failed to clean up file on error:', err.message);
      }
    }

    res.status(500).json({ 
      error: 'Decompression failed', 
      message: error.message 
    });
  }
};

// Clean up old files periodically
exports.cleanupOldFiles = () => {
  const uploadsDir = path.join(__dirname, 'uploads');
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours

  try {
    const files = fs.readdirSync(uploadsDir);
    const now = Date.now();

    files.forEach(file => {
      const filePath = path.join(uploadsDir, file);
      const stats = fs.statSync(filePath);
      
      if (now - stats.mtime.getTime() > maxAge) {
        try {
          fs.unlinkSync(filePath);
          console.log(`Cleaned up old file: ${file}`);
        } catch (err) {
          console.warn(`Failed to clean up file ${file}:`, err.message);
        }
      }
    });
  } catch (error) {
    console.error('Cleanup error:', error);
  }
}; 