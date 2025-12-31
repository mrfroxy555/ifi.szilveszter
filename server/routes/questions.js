const express = require('express');
const router = express.Router();
const Question = require('../models/Question');

// GET all questions
router.get('/', async (req, res) => {
    try {
        const questions = await Question.find();
        res.json(questions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST new question
router.post('/', async (req, res) => {
    const question = new Question({
        text: req.body.text,
        type: req.body.type,
        options: req.body.options,
        category: req.body.category
    });

    try {
        const newQuestion = await question.save();
        res.status(201).json(newQuestion);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Seed questions
router.post('/seed', async (req, res) => {
    try {
        await Question.deleteMany({}); // Clear existing
        const questions = req.body.questions;
        await Question.insertMany(questions);
        res.json({ message: 'Database seeded successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
