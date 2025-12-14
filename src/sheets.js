import {authenticate} from '@google-cloud/local-auth';
import {google} from 'googleapis';
import isEqual from 'lodash.isequal';


import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class SheetsController{
    prevData = null

    constructor(credentials){
        this.credentials = credentials
    }

    async authToSheets(){
        return authenticate({
            scopes: this.credentials.SCOPES,
            keyfilePath: this.credentials.CREDENTIALS_PATH,
        });
    }

    async pollSheets(sheetId, columnRanges) {
        const auth = await this.authToSheets()
        const sheets = google.sheets({version: 'v4', auth});

        try {
            const response = await sheets.spreadsheets.values.batchGet({
                    spreadsheetId: sheetId,
                    ranges: columnRanges,
                    majorDimension: 'ROWS'
                });

            const {valueRanges} = response.data;
            
            const toursData = valueRanges[0].values
            const filteredTours = toursData.filter(row => 
                row[0] !== 'Cancelled' && row[5] && row[7] && row[9] && row[11] === 'ready'
            )

            if (!isEqual(filteredTours, this.prevData)) {
                this.prevData = filteredTours;
                return filteredTours;
            }

            return null;

        } catch (error) {
            console.error('[SheetsController] Ошибка при чтении таблицы:', {
                message: error.message,
                code: error.code,
                stack: error.stack,
            });

            return []
        }
    }
}

// const credentialsSheets = {
//     SCOPES: [
//         'https://www.googleapis.com/auth/spreadsheets.readonly',
//         ],
//     CREDENTIALS_PATH: join(__dirname, '../credentials.json'),
// }

// const sheetsValues = {
//     sheetId: '1hZOouz5RHwmx8SbJyQa957MG2DTa0UuOPecGsFQygbk',
//     sheetRange: 'Лист1!A2:K',
// }

// const sheetsController = new SheetsController(credentialsSheets)
// const data = await sheetsController.pollSheets(sheetsValues.sheetId, sheetsValues.sheetRange)
// const s = data[0]
// console.log(s[10].split(',').map(link => link.trim()))