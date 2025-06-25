const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// In-memory history storage for development (without MongoDB)
let inMemoryHistory = [];

// Get user's compression history
router.get('/', auth, async (req, res) => {
  try {
    // Filter history by user ID (in development, all users share the same history)
    const userHistory = inMemoryHistory
      .filter(entry => entry.user === req.user.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 50); // Limit to last 50 operations
    
    res.json(userHistory);
  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// Delete a history entry
router.delete('/:id', auth, async (req, res) => {
  try {
    const index = inMemoryHistory.findIndex(entry => 
      entry._id === req.params.id && entry.user === req.user.id
    );
    
    if (index === -1) {
      return res.status(404).json({ error: 'History entry not found' });
    }
    
    inMemoryHistory.splice(index, 1);
    res.json({ message: 'History entry deleted successfully' });
  } catch (error) {
    console.error('History delete error:', error);
    res.status(500).json({ error: 'Failed to delete history entry' });
  }
});

// Clear all history for user
router.delete('/', auth, async (req, res) => {
  try {
    inMemoryHistory = inMemoryHistory.filter(entry => entry.user !== req.user.id);
    res.json({ message: 'All history cleared successfully' });
  } catch (error) {
    console.error('History clear error:', error);
    res.status(500).json({ error: 'Failed to clear history' });
  }
});

// Export the in-memory history array so controllers can add to it
module.exports = { router, inMemoryHistory }; 