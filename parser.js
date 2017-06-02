const fs = require('fs');
const csv = require('csv');
const promisify = require("es6-promisify");
const stringifyCSV = promisify(csv.stringify);
const firstline = require('firstline');
const nordeaParser = require('./nordea-parser');
const swedbankParser = require('./swedbank-parser');

function _findParser(fileName) {
    return firstline(fileName).then(headerRow => {
        let parser = [nordeaParser, swedbankParser].find(parser => parser.canParse(headerRow));
        if (!parser) {
            throw new Error('Unknown file format');        
        }

        return parser;     
    });
}

function parse(fileName) {
    return _findParser(fileName).then(parser => parser.parse(fileName));
}

module.exports = {
    parse: parse
}

