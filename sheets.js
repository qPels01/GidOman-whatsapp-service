import path from 'node:path';
import process from 'node:process';
import {authenticate} from '@google-cloud/local-auth';
import {google} from 'googleapis';

const SCOPES = [
            'https://www.googleapis.com/auth/spreadsheets.readonly',
            ];

const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

let prevData = null

export async function pollSheets() {
    const auth = await authenticate({
        scopes: SCOPES,
        keyfilePath: CREDENTIALS_PATH,
    });
    
    const sheets = google.sheets({version: 'v4', auth});

    const response = await sheets.spreadsheets.values.batchGet({
            spreadsheetId: '1hZOouz5RHwmx8SbJyQa957MG2DTa0UuOPecGsFQygbk',
            ranges: ['Лист1!F2:F','Лист1!H2:H','Лист1!J2:J','Лист1!P2:P'],
            majorDimension: 'COLUMNS'
        });

    const {valueRanges} = response.data;
    const toursData = {
            tours: valueRanges[0]?.values?.[0] || [],
            phoneNumber: valueRanges[1]?.values?.[0] || [],
            pickUpHotel: valueRanges[2]?.values?.[0] || [],
            mailDate: valueRanges[3]?.values?.[0] || []
        };
    
    if (JSON.stringify(prevData) !== JSON.stringify(toursData)){
        prevData = toursData;
        console.log(prevData)
        return prevData
    };

    return
}

setInterval(pollSheets, 10000)

