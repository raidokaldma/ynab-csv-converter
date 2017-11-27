const fs = require('fs');
const csv = require('csv');
const promisify = require("es6-promisify");
const parseFloat = require('parse-float');
const moment = require('moment');
const firstline = require('firstline');
const parseCSV = promisify(csv.parse);
const readFileAsync = promisify(fs.readFile);

module.exports = class CSVConverterSwedbank {
    constructor(fileName) {
        this.fileName = fileName;
    }

    static async canParse(fileName) {
        let firstRow = await firstline(fileName);
        return firstRow.startsWith('"Kliendi konto";"Reatüüp";');
    }

    static async createConverter(fileName) {
        return await CSVConverterSwedbank.canParse(fileName) ? new CSVConverterSwedbank(fileName) : null;
    }

    async convert() {
        let csvContents = await readFileAsync(this.fileName, 'utf8');
        let csvAsObject = await parseCSV(csvContents, {delimiter: ';', auto_parse: true, columns: true});

        // Excluding rows for Algsaldo (10), Käive (82), lõppsaldo (86)
        // Only including user transactions (20)
        let filteredData = csvAsObject.filter(row => row['Reatüüp'] === 20);

        return filteredData.map(row => {
            let amount = parseFloat(row['Summa']);
            let date = moment(row['Kuupäev'], 'DD.MM.YYYY').format('DD/MM/YYYY');
            let isOutFlow = row['Deebet/Kreedit'] === 'D';

            return {
                Date: date,
                Payee: row['Saaja/Maksja'] || 'Swedbank',
                Category: '',
                Memo: row['Selgitus'],
                Outflow: isOutFlow ? amount : '',
                Inflow: isOutFlow ? '' : amount
            };
        });
    }

    getOutputFileName() {
        return 'ynab-swedbank.csv';
    }
};
