const fs = require('fs');
const csv = require('csv');
const promisify = require("es6-promisify");
const parseFloat = require('parse-float');
const moment = require('moment');
const parseCSV = promisify(csv.parse);
const stringifyCSV = promisify(csv.stringify);
const textEncoding = require('text-encoding');

function canParse(firstLine) {
    return firstLine.startsWith('"Konto";"Dokumendi nr";');
}

function parse(fileName) {
    let csvContents = new textEncoding.TextDecoder('iso-8859-4').decode(fs.readFileSync(fileName));

    return parseCSV(csvContents, {delimiter: ';', auto_parse: true, columns: true}).then(data => {
        return data.map(row => {
            let amount = parseFloat(row['Summa']);
            let date = moment(row['Väärtuspäev'], 'DD.MM.YYYY').format('DD/MM/YYYY');
            let isOutFlow = row['Deebet/Kreedit'] === 'D';
            let memo = row['Selgitus'];
            let payee = row['Saaja/Maksja nimi'] || 'Nordea';

            let cardPaymentMatch = memo.match(/^Kaarditehing (\d+)(.*?)\d{2}.\d{2}.\d{2}\s\d{2}:\d{2}:\d{2}.*/) 
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
    });
}

module.exports = {
    canParse,
    parse
}