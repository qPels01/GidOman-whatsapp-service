import { google } from 'googleapis';
import isEqual from 'lodash.isequal';

export class SheetsController {
    prevData = null;

    constructor(credentials) {
        this.credentials = credentials;
    }

    async authToSheets() {
        const auth = new google.auth.GoogleAuth({
            scopes: this.credentials.SCOPES,
            keyFile: this.credentials.CREDENTIALS_PATH,
        });

        this.sheets = google.sheets({
            version: 'v4',
            auth,
        });
    }

    async pollSheets(sheetId, columnRanges) {
        if (!this.sheets) {
            await this.authToSheets();
        }

        try {
            const response = await this.sheets.spreadsheets.values.batchGet({
                spreadsheetId: sheetId,
                ranges: columnRanges,
                majorDimension: 'ROWS',
            });

            const { valueRanges } = response?.data;

            const toursData = valueRanges[0]?.values ?? [];

            if (toursData?.length === 0) return null;

            const filteredTours = toursData.filter((row) => row[0] && row[1] && row[4] && row[6] && (row[10] || row[11]));

            if (!isEqual(filteredTours, this.prevData)) {
                this.prevData = filteredTours;
                return filteredTours;
            }

            return toursData;
        } catch (error) {
            console.error('[SheetsController] Ошибка при чтении таблицы:', {
                message: error.message,
                code: error.code,
                stack: error.stack,
            });

            return null;
        }
    }
}
