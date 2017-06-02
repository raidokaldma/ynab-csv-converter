# YNAB CSV converter
Script for converting bank account statements into YNAB compatible CSV file

Currently supported Estonian banks:
* Swedbank
* Nordea

## Making it available as right click menu item in Mac OS X
* Service receives selected "Files or folders" in "Finder.app"
* Run Shell script
  * Pass input as arguments
  * /path/to/your/bin/node ~/Projects/ynab-csv-converter/index.js "$1"
