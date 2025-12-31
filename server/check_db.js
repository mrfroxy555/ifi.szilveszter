const mongoose = require('mongoose');
const Question = require('./models/Question');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://hevesitamas7:tuglika2005@cluster0.riugxg4.mongodb.net/szilveszter?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI)
    .then(async () => {
        const count = await Question.countDocuments();
        console.log(`Total questions: ${count}`);
        const selectQuestions = await Question.countDocuments({ type: 'select' });
        console.log(`Select questions: ${selectQuestions}`);
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
