const mongoose = require('mongoose');
const Question = require('./models/Question');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://hevesitamas7:tuglika2005@cluster0.riugxg4.mongodb.net/szilveszter?retryWrites=true&w=majority';

const members = [
    "Ábel", "Henrietta", "Beni", "Eszter", "Endi",
    "Sándor", "Kincső", "Kristóf", "Sámuel", "Sára", "Tamás"
];

const leaders = [
    "Hevesi T.", "Gerics S.", "Mátyás B.", "Tóth Lajos"
];

const allPeople = [...members, ...leaders].sort();

const questions = [
    // --- Faith ---
    {
        text: "Mennyire érezted Isten jelenlétét ebben az évben?",
        type: "scale",
        options: ["Egyáltalán nem", "Nagyon erősen"],
        category: "faith"
    },
    {
        text: "Mi volt a legmeghatározóbb lelki élményed idén? (Egy szóban)",
        type: "text",
        category: "faith"
    },
    {
        text: "Hogy látod, mennyit fejlődött a hited idén?",
        type: "scale",
        options: ["Visszaesett", "Sokat fejlődött"],
        category: "faith"
    },
    {
        text: "Melyik bibliai történet/ige volt számodra a legfontosabb idén?",
        type: "text",
        category: "faith"
    },
    {
        text: "Mennyit imádkoztál másokért idén?",
        type: "scale",
        options: ["Keveset", "Sokat"],
        category: "faith"
    },

    // --- Community / People Selection ---
    {
        text: "Szerinted ki a legjobb ifi vezető?",
        type: "select",
        options: leaders,
        category: "community"
    },
    {
        text: "Kivel kerültél közelebb idén?",
        type: "select",
        options: allPeople,
        category: "community"
    },
    {
        text: "Ki a legviccesebb a közösségben?",
        type: "select",
        options: allPeople,
        category: "community"
    },
    {
        text: "Ki a legkomolyabb?",
        type: "select",
        options: allPeople,
        category: "community"
    },

    {
        text: "Kivel beszélgetnél szívesen többet jövőre?",
        type: "select",
        options: allPeople,
        category: "community"
    },


    // --- Community General ---
    {
        text: "Mennyire érzed magad a közösség részének?",
        type: "scale",
        options: ["Kívülálló", "Családtag"],
        category: "community"
    },
    {
        text: "Melyik volt a legjobb közös program idén?",
        type: "text",
        category: "community"
    },
    {
        text: "Szerinted miben kellene leginkább fejlődnie a közösségünknek?",
        type: "text",
        category: "community"
    },

    // --- Year Events / Fun ---
    {
        text: "Hogy értékeled a 2025-ös évedet?",
        type: "scale",
        options: ["Borzalmas", "Fantasztikus"],
        category: "events"
    },
    {
        text: "Mi az, amit leginkább vársz a jövő évben?",
        type: "text",
        category: "events"
    },
    {
        text: "Ha egy szóval kéne jellemezni az évedet, mi lenne az?",
        type: "text",
        category: "events"
    },
    {
        text: "Mennyire sikerült teljesíteni az idei terveidet?",
        type: "scale",
        options: ["Semennyire", "Teljesen"],
        category: "events"
    },
    {
        text: "Mi volt a legviccesebb pillanat idén?",
        type: "text",
        category: "events"
    },
    {
        text: "Melyik hónap volt a legjobb idén?",
        type: "select",
        options: ["Január", "Február", "Március", "Április", "Május", "Június", "Július", "Augusztus", "Szeptember", "Október", "November", "December"],
        category: "events"
    },

    // --- Deep Reflection (New from Image) ---
    {
        text: "Mi volt az az esemény az idén, amire a legbüszkébb vagy?",
        type: "text",
        category: "faith"
    },
    {
        text: "Mi volt a legnagyobb kihívás, amit sikeresen leküzdöttél?",
        type: "text",
        category: "faith"
    },
    {
        text: "Volt-e olyan álmod vagy célod, amit sikerült megvalósítani?",
        type: "text",
        category: "events"
    },
    {
        text: "Mi volt a legszomorúbb élményed az évben?",
        type: "text",
        category: "events"
    },
    {
        text: "Miben fejlődtél a legtöbbet lelkileg az elmúlt évben?",
        type: "text",
        category: "faith"
    },
    {
        text: "Milyen bűnben estél el leginkább, és mit tanultál belőle? (Anonim!)",
        type: "text",
        category: "faith"
    },
    {
        text: "Hol tapasztaltad meg leginkább Isten jelenlétét?",
        type: "text",
        category: "faith"
    },
    {
        text: "Milyen lelki célt tűzöl ki magad elé a jövőre nézve?",
        type: "text",
        category: "faith"
    }
];

mongoose.connect(MONGODB_URI)
    .then(async () => {
        console.log('Connected to MongoDB');
        await Question.deleteMany({});
        console.log('Cleared existing questions');
        await Question.insertMany(questions);
        console.log('Seeded questions');
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
