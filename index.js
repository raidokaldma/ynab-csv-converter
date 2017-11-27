#!/usr/bin/env node

const converter = require('./ynab-csv-converter');
const notifier = require('node-notifier');

let fileIn = process.argv[2];
if (!fileIn) {
    console.error('Missing argument - file');
    process.exit(1);
}

async function convertAndNotify() {
    try {
        let fileOut = await converter.convertToYNABCSV(fileIn);
        notifier.notify({title: 'YNAB transformer', message: `Created ${fileOut}`});
    }
    catch(err) {
        console.error(`YNAB conversion failed with: ${err.message}`);
        process.exit(1);
    }
}

// noinspection JSIgnoredPromiseFromCall
convertAndNotify();
