# YNAB CSV converter
_For personal use!_

Script for converting bank account statements into YNAB compatible CSV file

Currently supported banks:
* Swedbank (Estonia)
* Nordea (Estonia)
* Revolut

## Making it available as right click menu item in Mac OS X
Create Automator Script Service with following settings:
 * Service receives selected "Files or folders" in "Finder.app"
 * Run Shell script
   * Pass input as arguments
   * `/path/to/your/bin/node ~/Projects/ynab-csv-converter/index.js "$1"`
