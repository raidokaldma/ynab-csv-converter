const fs = require('fs');
const csv = require('csv');
const promisify = require("es6-promisify");
const parseFloat = require('parse-float');
const moment = require('moment');
const parseCSV = promisify(csv.parse);

function canParse(firstLine) {
    // Completed Date;Reference;Paid Out (EUR);Paid In (EUR);Exchange Out;Exchange In; Balance (EUR)
    return firstLine.startsWith('Completed Date;Reference;');
}

function parse(fileName) {
    let csvContents = fs.readFileSync(fileName, 'utf8');

    return parseCSV(csvContents, {delimiter: ';', auto_parse: true, columns: true}).then(data => {
        return data.map(row => {
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
    });
}

module.exports = {
    canParse,
    parse
};