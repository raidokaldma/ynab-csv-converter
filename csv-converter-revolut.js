const fs = require('fs');
const csv = require('csv');
const promisify = require("es6-promisify");
const parseFloat = require('parse-float');
const moment = require('moment');
const firstline = require('firstline');
const parseCSV = promisify(csv.parse);
const readFileAsync = promisify(fs.readFile);

module.exports = class CSVConverterRevolut {
    constructor(fileName) {
        this.fileName = fileName;
    }

    static async canParse(fileName) {
        let firstRow = await firstline(fileName);
        return firstRow.startsWith('Completed Date;Reference;');
    }

    static async createConverter(fileName) {
        return await CSVConverterRevolut.canParse(fileName) ? new CSVConverterRevolut(fileName) : null;
    }

    async convert() {
        let csvContents = await readFileAsync(this.fileName, 'utf8');
        let csvAsObject = await parseCSV(csvContents, {delimiter: ';', auto_parse: true, columns: true});
        return csvAsObject.map(row => {
            let paidOut = parseFloat(row['Paid Out (EUR)']) || '';
            let paidIn = parseFloat(row['Paid In (EUR)']) || '';
            let date = moment(row['Completed Date'], 'D MMMM YYYY').format('DD/MM/YYYY');

            return {
                Date: date,
                Payee: row['Reference'],
                Category: '',
                Memo: row['Reference'],
                Outflow: paidOut,
                Inflow: paidIn
            }
        });
    }

    getOutputFileName() {
        return 'ynab-revolut.csv';
    }
};
