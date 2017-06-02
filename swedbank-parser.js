const fs = require('fs');
const csv = require('csv');
const promisify = require("es6-promisify");
const parseFloat = require('parse-float');
const moment = require('moment');
const parseCSV = promisify(csv.parse);

function canParse(firstLine) {
    return firstLine.startsWith('"Kliendi konto";"Reatüüp";');
}

function parse(fileName) {
    let csvContents = fs.readFileSync(fileName, 'utf8');

    return parseCSV(csvContents, {delimiter: ';', auto_parse: true, columns: true}).then(data => {
        // Excluding rows for Algsaldo (10), Käive (82), lõppsaldo (86)
        // Only including user transactions (20)
        let filteredData = data.filter(row => row['Reatüüp'] === 20);

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
            }
        });
    });
}

module.exports = {
    canParse,
    parse
}