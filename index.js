#!/usr/bin/env node

const fs = require('fs');
const csv = require('csv');
const promisify = require("es6-promisify");
const stringifyCSV = promisify(csv.stringify);
const parser = require('./parser');
const notifier = require('node-notifier');
const path = require('path');

let fileIn = process.argv[2];
if (!fileIn) {
    console.error('Missing argument - file');
    process.exit(1);
}

let directory = path.dirname(fileIn);
let fileInName = path.basename(fileIn, '.csv');
let fileOut = path.join(directory, `${fileInName}-ynab.csv`);

return parser.parse(fileIn).then(ynabData => {
    return stringifyCSV(ynabData, {header: true}).then(resultCSV => {
        fs.writeFileSync(fileOut, resultCSV);
        notifier.notify({title: 'YNAB parser', message: `Created ${fileOut}`});
    }); 
});
