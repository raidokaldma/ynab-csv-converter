const fs = require('fs');
const csv = require('csv');
const promisify = require("es6-promisify");
const parseFloat = require('parse-float');
const moment = require('moment');
const firstline = require('firstline');
const TextDecoder = require("text-encoding").TextDecoder;
const parseCSV = promisify(csv.parse);
const readFileAsync = promisify(fs.readFile);

module.exports = class CSVConverterNordea {
    constructor(fileName) {
        this.fileName = fileName;
    }

    static async canParse(fileName) {
        let firstRow = await firstline(fileName);
        return firstRow.startsWith('"Konto";"Dokumendi nr";');
    }

    static async createConverter(fileName) {
        return await CSVConverterNordea.canParse(fileName) ? new CSVConverterNordea(fileName) : null;
    }

    async convert() {
        let csvContents = new TextDecoder('iso-8859-4').decode(await readFileAsync(this.fileName));
        let csvAsObject = await parseCSV(csvContents, {delimiter: ';', auto_parse: true, columns: true});

        return csvAsObject.map(row => {
            let amount = parseFloat(row['Summa']);
            let date = moment(row['Väärtuspäev'], 'DD.MM.YYYY').format('DD/MM/YYYY');
            let isOutFlow = row['Deebet/Kreedit'] === 'D';
            let memo = row['Selgitus'];
            let payee = row['Saaja/Maksja nimi'] || 'Nordea';

            // Remove noise
            memo = memo.replace('Pangasisene Db tehing ', '');

            let cardPaymentMatch = memo.match(/^Kaarditehing (\d+)(.*?)\d{2}.\d{2}.\d{2}\s\d{2}:\d{2}:\d{2}.*/);
            if (cardPaymentMatch) {
                memo = `Card ${cardPaymentMatch[1]}`;
                payee = cardPaymentMatch[2];
            }

            return {
                Date: date,
                Payee: payee,
                Category: '',
                Memo: memo,
                Outflow: isOutFlow ? amount : '',
                Inflow: isOutFlow ? '' : amount
            }
        });
    }

    getOutputFileName() {
        return 'ynab-nordea.csv';
    }
};
