const https = require('https');

// Get the word from command line arguments
const word = process.argv[2];

if (!word) {
    console.log("Usage: node dictionary-cli.js <word>");
    process.exit(1);
}

const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;

https.get(url, (res) => {
    let data = '';

    // A chunk of data has been received.
    res.on('data', (chunk) => {
        data += chunk;
    });

    // The whole response has been received.
    res.on('end', () => {
        if (res.statusCode === 404) {
            console.error(`Error: Word '${word}' not found.`);
            return;
        }
        if (res.statusCode !== 200) {
            console.error(`Error: API returned status code ${res.statusCode}`);
            return;
        }

        try {
            const parsedData = JSON.parse(data);
            const entry = parsedData[0];
            const meaning = entry.meanings[0];
            const definition = meaning.definitions[0];

            console.log(`\nWord: ${entry.word}`);
            if (entry.phonetic) console.log(`Phonetic: ${entry.phonetic}`);
            console.log(`Part of Speech: ${meaning.partOfSpeech}`);
            console.log(`Definition: ${definition.definition}`);
            if (definition.example) console.log(`Example: ${definition.example}`);
            console.log('\n');

        } catch (e) {
            console.error("Error parsing response:", e.message);
        }
    });

}).on("error", (err) => {
    console.error("Error: " + err.message);
});
