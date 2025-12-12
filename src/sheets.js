import {authenticate} from '@google-cloud/local-auth';
import {google} from 'googleapis';
import isEqual from 'lodash.isequal';

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
                row[0] && row[0] !== 'Cancelled' && row[1] && row[5] && row[7] && row[8] && row[9] && row[8] !== 'NA'
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