// Import Express.js
const express = require('express');
// Import built-in Node.js package 'path' to resolve path of files that are located on the server
const path = require('path');
const noteData = require("./db/db.json");
const fs = require('fs');
const util = require('util');
const { v4: uuidv4 } = require('uuid');
const e = require('express');
// Promise version of fs.readFile
const readFromFile = util.promisify(fs.readFile);

// Specify on which port the Express.js server will run
const PORT = process.env.PORT || 3001;
// Initialize an instance of Express.js
const app = express();

app.use(express.json());
// Static middleware pointing to the public folder
app.use(express.static('public'));


// GET route to get all of the notes
app.get('/api/notes', (req, res) => {
    readFromFile("./db/db.json").then((data) => res.json(JSON.parse(data)));
});

// GET request for notes from index.html and notes.html
app.get('/notes', (req, res) =>
    res.sendFile(path.join(__dirname, './public/notes.html'))

);
// POST request for notes
app.post(`/api/notes`, (req, res) => {
    // Log that a POST request was received
    console.info(`${req.method} request received to add a note`);
    // Destructuring assignment for the items in req.body
    const { title, text } = req.body;

    // Variable for the object we will save
    const newNotes = {
        title,
        text,
        id: uuidv4(),
    };
    // Obtain existing reviews
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
        } else {
            // Convert string into JSON object
            const parsedNotes = JSON.parse(data);

            // Add a new note
            parsedNotes.push(newNotes);

            // Write updated reviews back to the file
            fs.writeFile('./db/db.json', JSON.stringify(parsedNotes, null, 4), (writeErr) =>
                writeErr
                    ? console.error(writeErr)
                    : console.info('Successfully updated reviews!')
            )
        }
    })
    res.json('added');
});
// Creating a DELETE request
app.delete("/api/notes/:id", (req, res) => {
    const deleteId= req.params.id;

    // Obtain existing reviews
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
        } else {
            // Convert string into JSON object
            const parsedNotes = JSON.parse(data);

            console.log("req params", req.params.id)
            const itemIndex = parsedNotes.findIndex(({ id }) => id === req.params.id);
            if (itemIndex >= 0) {
                console.log(itemIndex)
                parsedNotes.splice(itemIndex, 1);
            }
            fs.writeFile('./db/db.json', JSON.stringify(parsedNotes, null, 4), (writeErr) =>
            writeErr
                ? console.error(writeErr)
                : console.info('Successfully updated reviews!')
        )
        }
    })
    res.json("deleted");
});

// Returns the index file
app.get('*', (req, res) =>
    res.sendFile(path.join(__dirname, './public/index.html'))
);
//create server listener
app.listen(PORT, () => console.log(`Example app listening at http://localhost:${PORT}`));