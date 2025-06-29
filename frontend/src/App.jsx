import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Toaster, toast } from "sonner";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "./components/ui/alert";
import { Progress } from "./components/ui/progress";
import AlgorithmCard from "./components/AlgorithmCard";
import { UploadCloud, File, BarChart, History, KeyRound, LogIn, Cpu, ArrowRight, Sun, Moon, Settings, ChevronDown, Unplug, ArrowDownToLine, ArrowUpFromLine, AlertTriangle, Download, BookOpen, Repeat, Binary, AlignLeft } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./components/ui/alert-dialog";
import CompressionChart from './components/CompressionChart';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Signup from './components/Signup';


const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5
    }
  }
};

const buttonHoverTap = {
  hover: { scale: 1.05 },
  tap: { scale: 0.95 }
}

const algorithmDetails = [
  {
    name: "Huffman Coding",
    icon: <AlignLeft className="w-8 h-8" />,
    description: "A lossless algorithm ideal for text files. It uses variable-length codes for characters based on their frequency.",
    details: "Huffman coding works by creating a binary tree of nodes, where leaves are characters and their frequency determines their position. More frequent characters get shorter binary codes, leading to significant compression for files with repetitive characters."
  },
  {
    name: "Run-Length Encoding (RLE)",
    icon: <Repeat className="w-8 h-8" />,
    description: "Simple lossless technique for data with long runs of repeated characters.",
    details: "RLE replaces sequences of identical data values (runs) with a single value and a count. For example, 'AAAAA' becomes '5A'. It's very fast but only effective on specific types of data, like simple bitmap images or certain text patterns."
  },
  {
    name: "LZ77",
    icon: <BookOpen className="w-8 h-8" />,
    description: "A dictionary-based algorithm that replaces repeated occurrences of data with references.",
    details: "The LZ77 algorithm maintains a 'sliding window' of recently seen data. When a sequence of characters is found that has already appeared in the window, it's replaced by a short pointer indicating the distance and length of the match. This is the basis for many modern compression algorithms like DEFLATE (used in PNG and ZIP)."
  },
   {
    name: "LZW",
    icon: <BookOpen className="w-8 h-8" />,
    description: "An improved dictionary-based algorithm used in formats like GIF and TIFF.",
    details: "Lempel-Ziv-Welch (LZW) builds a dictionary of strings from the input data. When a recurring string is found, it is replaced with its corresponding code from the corresponding dictionary. Unlike LZ77, it doesn't require a sliding window, and the dictionary is built dynamically during compression and decompression."
  },
  {
    name: "Brotli",
    icon: <Binary className="w-8 h-8" />,
    description: "A modern, powerful algorithm developed by Google, excellent for web and binary files.",
    details: "Brotli is a highly effective lossless compression algorithm that uses a combination of a modern variant of the LZ77 algorithm, Huffman coding, and 2nd order context modeling. It provides a higher compression ratio than many other algorithms and is widely used for serving web assets."
  }
];

function App() {
  // UI State
  const [dragActive, setDragActive] = useState(false);
  
  // App Logic State
  const [file, setFile] = useState(null);
  const [algorithm, setAlgorithm] = useState('huffman');
  const [operation, setOperation] = useState('compress');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [algorithms, setAlgorithms] = useState([]);
  const [isBinaryFile, setIsBinaryFile] = useState(false);
  
  // Auth State
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null); // You might want to store user details
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [clearHistoryAlert, setClearHistoryAlert] = useState(false);

  // Effects
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);
  
  useEffect(() => {
    fetchAlgorithms();
    if (token) {
      fetchHistory();
    }
  }, [token]);

  useEffect(() => {
    if (file) {
      const binaryTypes = [
        'application/pdf', 
        'image/jpeg', 
        'image/png', 
        'image/gif',
        'application/zip',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/octet-stream'
      ];
      
      if (binaryTypes.includes(file.type)) {
        setIsBinaryFile(true);
        setAlgorithm('brotli');
        toast.info("Binary file detected. Brotli algorithm selected for best results.", {
          description: "Other algorithms may corrupt binary files or increase their size.",
        });
      } else {
        setIsBinaryFile(false);
      }
    }
  }, [file]);

  useEffect(() => {
    const updateToken = () => setToken(localStorage.getItem('token'));
    window.addEventListener('token', updateToken);
    return () => window.removeEventListener('token', updateToken);
  }, []);

  // File Handling
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // API Calls
  const handleLogin = async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, { username, password });
        const { token, user } = response.data;
        setToken(token);
        setUser(user);
        localStorage.setItem('token', token);
        toast.success(`Welcome back, ${user.username}!`);
      } catch (err) {
        toast.error(err.response?.data?.error || 'Login failed');
      } finally {
        setLoading(false);
      }
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
        // For simplicity, using the same fields. In real app, you'd add an email field.
      await axios.post(`${API_BASE_URL}/auth/register`, { username, password, email: `${username}@example.com` });
      toast.success('Registration successful! Please log in.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    toast.info("You have been logged out.");
  };

  const handleSubmit = async () => {
    if (!file) {
      toast.warning('Please select a file first.');
      return;
    }

    setLoading(true);
    setProgress(0);
    setStats(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('algorithm', algorithm);

    // For decompression, you might need to send metadata. This is a simplified example.
    if (operation === 'decompress') {
      const lastOperation = history.find(h => h.processedFilename === file.name);
      if (lastOperation && lastOperation.meta) {
        formData.append('meta', JSON.stringify(lastOperation.meta));
        formData.append('originalFilename', lastOperation.originalFilename);
      } else {
         toast.warning("Metadata for decompression not found in history. Decompression may fail.");
         formData.append('meta', JSON.stringify({}));
      }
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/compression/${operation}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
        },
      });

      toast.success(response.data.message);
      
      const apiStats = response.data.stats;
      const normalizedStats = {
        ...apiStats,
        originalSize: apiStats.originalSize || apiStats.compressedSize || 0,
        processedSize: apiStats.compressedSize || apiStats.decompressedSize || 0,
        ratio: apiStats.compressionRatio !== undefined
          ? parseFloat(apiStats.compressionRatio)
          : (apiStats.originalSize && apiStats.processedSize
              ? ((1 - apiStats.processedSize / apiStats.originalSize) * 100)
              : null),
        time: apiStats.processingTime || apiStats.time || null,
      };
      
      setStats(normalizedStats);
      fetchHistory(); // Refresh history after an operation
    } catch (err) {
      toast.error(err.response?.data?.error || 'An error occurred during the operation.');
    } finally {
      setLoading(false);
    }
  };
  
    const fetchHistory = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/history`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setHistory(response.data);
        } catch (err) {
            toast.error("Failed to fetch history.");
        }
    };
    
    const handleDownload = async (filename) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/download/${filename}`, {
                responseType: 'blob',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success(`Downloading ${filename}`);
        } catch (err) {
            toast.error('Download failed.');
        }
    };

  const fetchAlgorithms = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/compression/algorithms`);
      if (Array.isArray(response.data)) {
        setAlgorithms(response.data);
        if(response.data.length > 0) {
          setAlgorithm(response.data[0].name);
        }
      } else {
        toast.error("Received unexpected data for algorithms.");
        setAlgorithms([]);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to fetch algorithms.');
      setAlgorithms([]);
    }
  };

  const handleClearHistory = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/api/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setHistory([]);
      toast.success("History cleared successfully.");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to clear history.");
    } finally {
      setClearHistoryAlert(false); // Close the dialog
    }
  };

  return (
    <Router>
      <Routes>
        {/* Landing page for unauthenticated users */}
        {!token && (
          <>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
        {/* Main app for authenticated users */}
        {token && (
          <>
            <Route path="/*" element={
              <div className="min-h-screen bg-background text-foreground font-sans">
                <div className="gradient-bg" />
                <Toaster richColors position="top-center" />
                <motion.header 
                  className="sticky top-0 z-50 py-3 px-4 md:px-6 border-b border-white/10 bg-background/50 backdrop-blur-lg"
                  initial={{ y: -100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                    <div className="container mx-auto flex justify-between items-center">
                        <h1 className="text-2xl font-bold flex items-center"><Cpu className="mr-3 text-primary"/>DataComp</h1>
                        <div className="flex items-center gap-4">
                            <motion.div whileHover="hover" whileTap="tap" variants={buttonHoverTap}>
                              <Button variant="ghost" onClick={handleLogout}>Logout</Button>
                            </motion.div>
                        </div>
                    </div>
                </motion.header>
                <motion.main 
                  className="container mx-auto p-4 md:p-6"
                >
                  <div className="grid gap-12">
                    
                    {/* Top Row: File Upload and Configuration */}
                    <div className="grid lg:grid-cols-5 gap-8">
                      <motion.div className="lg:col-span-3" variants={itemVariants}>
                        <Card 
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            className={`transition-all duration-300 bg-card/80 backdrop-blur-sm border-white/10 shadow-2xl ${dragActive ? 'border-primary ring-2 ring-primary' : ''}`}
                        >
                            <CardHeader>
                                <CardTitle className="flex items-center text-2xl"><UploadCloud className="mr-3 text-primary"/>File Upload</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div 
                                  className="border-2 border-dashed border-muted rounded-lg p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary/50 transition-colors"
                                  onClick={() => document.getElementById('file-input').click()}
                                >
                                    <Input id="file-input" type="file" className="hidden" onChange={handleFileChange} />
                                    {file ? (
                                        <>
                                          <File className="w-16 h-16 text-primary" />
                                          <p className="mt-4 text-xl font-semibold">{file.name}</p>
                                          <p className="text-md text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                                        </>
                                    ) : (
                                        <>
                                          <UploadCloud className="w-16 h-16 text-muted-foreground" />
                                          <p className="mt-4 text-lg">Drag & drop a file or click to upload</p>
                                          <p className="text-sm text-muted-foreground">Supports all common file types</p>
                                        </>
                                    )}
                                </div>
                                {loading && (
                                  <div className="mt-6 w-full">
                                     <Progress value={progress} className="w-full" />
                                     <p className="text-sm text-muted-foreground text-center mt-2">{progress}% completed</p>
                                  </div>
                                )}
                            </CardContent>
                        </Card>
                      </motion.div>

                      <motion.div className="lg:col-span-2" variants={itemVariants}>
                        <div className="space-y-8 h-full flex flex-col">
                          <Card className="flex-grow bg-card/80 backdrop-blur-sm border-white/10 shadow-2xl">
                              <CardHeader>
                                  <CardTitle className="flex items-center"><Settings className="mr-3 text-primary"/>Configuration</CardTitle>
                              </CardHeader>
                              <CardContent className="grid gap-6">
                                  <div className="space-y-2">
                                      <Label className="flex items-center text-md"><Unplug className="mr-2"/>Operation</Label>
                                      <Select value={operation} onValueChange={setOperation}>
                                          <SelectTrigger className="py-6 text-lg">
                                              <SelectValue placeholder="Select operation" />
                                          </SelectTrigger>
                                          <SelectContent>
                                              <SelectItem value="compress">
                                                <div className="flex items-center text-lg">
                                                    <ArrowDownToLine className="mr-2 h-5 w-5" />
                                                    Compress
                                                </div>
                                              </SelectItem>
                                              <SelectItem value="decompress">
                                                <div className="flex items-center text-lg">
                                                    <ArrowUpFromLine className="mr-2 h-5 w-5" />
                                                    Decompress
                                                </div>
                                              </SelectItem>
                                          </SelectContent>
                                      </Select>
                                  </div>
                                  <div className="space-y-2">
                                      <Label className="flex items-center text-md"><Cpu className="mr-2"/>Algorithm</Label>
                                      <Select value={algorithm} onValueChange={setAlgorithm} disabled={algorithms.length === 0}>
                                          <SelectTrigger className="py-6 text-lg">
                                              <SelectValue placeholder="Select algorithm" />
                                          </SelectTrigger>
                                          <SelectContent>
                                              {algorithms.length > 0 ? (
                                                algorithms.map((algo) => (
                                                  <SelectItem 
                                                    key={algo.name} 
                                                    value={algo.name}
                                                    disabled={isBinaryFile && algo.name !== 'brotli'}
                                                    className="text-lg"
                                                  >
                                                    {algo.label}
                                                  </SelectItem>
                                                ))
                                              ) : (
                                                <SelectItem value="none" disabled>No algorithms loaded</SelectItem>
                                              )}
                                          </SelectContent>
                                      </Select>
                                  </div>
                              </CardContent>
                          </Card>
                          <motion.div whileHover="hover" whileTap="tap" variants={buttonHoverTap}>
                            <Button className="w-full font-semibold text-xl py-8 flex items-center" onClick={handleSubmit} disabled={loading || !file}>
                                {loading ? (
                                  <>
                                    <motion.div
                                      className="mr-2"
                                      animate={{ rotate: 360 }}
                                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    >
                                      <Cpu className="h-6 w-6"/>
                                    </motion.div>
                                    Processing...
                                  </>
                                ) : (
                                  <>
                                    <ArrowRight className="mr-2 h-6 w-6"/>
                                    Run {operation.charAt(0).toUpperCase() + operation.slice(1)}
                                  </>
                                )}
                            </Button>
                          </motion.div>
                        </div>
                      </motion.div>
                    </div>


                    {/* Bottom Row: Stats and History */}
                    <div className="grid lg:grid-cols-2 gap-8">
                        <motion.div variants={itemVariants}>
                            <Card className="h-full bg-card/80 backdrop-blur-sm border-white/10 shadow-2xl">
                                <CardHeader>
                                    <CardTitle className="flex items-center text-2xl"><BarChart className="mr-3 text-primary"/>Statistics</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {stats ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                                            <div className="relative w-full h-64">
                                              <CompressionChart stats={stats} />
                                            </div>
                                            <div className="space-y-4 text-lg">
                                                <p><strong>Original Size:</strong> {(stats.originalSize / 1024).toFixed(2)} KB</p>
                                                <p><strong>{operation === 'compress' ? 'Compressed' : 'Decompressed'} Size:</strong> {(stats.processedSize / 1024).toFixed(2)} KB</p>
                                                <p><strong>Ratio:</strong> <span className="ml-2 text-white">{stats.ratio ? `${stats.ratio.toFixed(2)}%` : <span className="text-yellow-400">N/A</span>}</span></p>
                                                <p><strong>Time:</strong> <span className="ml-2 text-white">{stats.time ? `${stats.time} ms` : <span className="text-yellow-400">N/A</span>}</span></p>
                                                <motion.div whileHover="hover" whileTap="tap" variants={buttonHoverTap} className="pt-2">
                                                  <Button onClick={() => handleDownload(stats.processedFilename)} className="w-full">
                                                    <Download className="mr-2 h-5 w-5"/>
                                                    Download {stats.processedFilename}
                                                  </Button>
                                                </motion.div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-64">
                                            <BarChart className="w-16 h-16 mb-4"/>
                                            <p className="text-lg">Run a compression or decompression to see stats here.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                          <Card className="h-full bg-card/80 backdrop-blur-sm border-white/10 shadow-2xl">
                              <CardHeader className="flex flex-row items-center justify-between">
                                  <CardTitle className="flex items-center text-2xl"><History className="mr-3 text-primary"/>History</CardTitle>
                                  {history.length > 0 && (
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <motion.div whileHover="hover" whileTap="tap" variants={buttonHoverTap}>
                                          <Button variant="destructive">Clear History</Button>
                                        </motion.div>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete your compression history.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction onClick={handleClearHistory}>Continue</AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  )}
                              </CardHeader>
                              <CardContent>
                                  {history.length > 0 ? (
                                      <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                                          {history.slice().reverse().map(item => (
                                              <div key={item._id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                                                  <div className="flex flex-col">
                                                      <span className="font-semibold">{item.originalFilename}</span>
                                                      <span className="text-sm text-muted-foreground">
                                                          {(item.action?.toUpperCase() || 'ACTION')} with {(item.algorithm?.toUpperCase() || 'ALGORITHM')}
                                                      </span>
                                                  </div>
                                                  <Button variant="ghost" size="icon" onClick={() => handleDownload(item.processedFilename)}>
                                                      <Download className="h-5 w-5"/>
                                                  </Button>
                                              </div>
                                          ))}
                                      </div>
                                  ) : (
                                    <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-64">
                                      <History className="w-16 h-16 mb-4"/>
                                      <p className="text-lg">Your past compressions will appear here.</p>
                                    </div>
                                  )}
                              </CardContent>
                          </Card>
                        </motion.div>
                    </div>
                    
                    <motion.div variants={itemVariants}>
                        <Alert variant="default" className="bg-card/80 backdrop-blur-sm border-white/10 shadow-lg">
                          <AlertTriangle className="h-4 w-4 text-primary" />
                          <AlertTitle className="font-bold">File Type Recommendation</AlertTitle>
                          <AlertDescription>
                            For best results on binary files (PDFs, images), use the **Brotli** algorithm. Text-based algorithms like Huffman or RLE are not suitable and may corrupt these files.
                          </AlertDescription>
                        </Alert>
                    </motion.div>
          </div>
        </motion.main>

        <motion.section 
          className="container mx-auto p-4 md:p-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <h2 className="text-3xl font-bold text-center mb-2">Learn About The Algorithms</h2>
            <p className="text-center text-muted-foreground mb-8">
              Discover the technology behind the compression.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
            {algorithmDetails.map((algo) => (
              <motion.div key={algo.name} variants={itemVariants}>
                <AlgorithmCard
                  name={algo.name}
                  icon={algo.icon}
                  description={algo.description}
                  details={algo.details}
                />
              </motion.div>
            ))}
          </div>
        </motion.section>
        <footer className="text-center p-6 text-muted-foreground">
          <p>Built with ❤️ using React, Node.js, and a bit of magic.</p>
        </footer>
      </div>
    } />
  </>
)}
</Routes>
</Router>
  );
}

export default App;
