// routes/listRoutes.js
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const List = require('../models/List');

const router = express.Router();

// Middleware to verify JWT
function verifyToken(req, res, next) {
  const token = req.header('authorization');
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
}

// Get all lists
router.get('/', verifyToken, async (req, res) => {
  try {
    const lists = await List.find({ owner: req.user.id });
    res.json(lists);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new list
router.post('/', verifyToken, async (req, res) => {
  const newList = new List({
    title: req.body.title,
    owner: req.user.id,
  });

  try {
    const savedList = await newList.save();
    res.status(201).json(savedList);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get cards for a list
router.get('/:listId/cards', verifyToken, async (req, res) => {
  try {
    const list = await List.findById(req.params.listId);
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }
    res.json(list.cards);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;