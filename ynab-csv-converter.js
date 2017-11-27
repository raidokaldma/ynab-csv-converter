const fs = require('fs');
const csv = require('csv');
const promisify = require("es6-promisify");
const stringifyCSV = promisify(csv.stringify);
const path = require('path');

const CSVConverterRevolut = require('./csv-converter-revolut');
const CSVConverterNordea = require('./csv-converter-nordea');
const CSVConverterSwedbank = require('./csv-converter-swedbank');

async function findCSVConverter(fileName) {
    let converterClasses = [CSVConverterRevolut, CSVConverterNordea, CSVConverterSwedbank];
    let converters = await Promise.all(converterClasses.map(converterClass => converterClass.createConverter(fileName)));
    let converter = converters.find(c => c); // First not null

    if (!converter) {
        throw new Error(`Don't know how to convert this file`);
    }

    return converter;
}

async function convertToYNABCSV(fileIn) {
    let converter = await findCSVConverter(fileIn);
    let ynabData = await converter.convert(fileIn);
    let resultCSV = await stringifyCSV(ynabData, {header: true});
    let fileOut = path.join(path.dirname(fileIn), converter.getOutputFileName());

    fs.writeFileSync(fileOut, resultCSV);
    fs.unlinkSync(fileIn);

    return fileOut;
}

module.exports = {
    convertToYNABCSV
};
