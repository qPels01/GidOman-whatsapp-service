import path from 'node:path';
import process from 'node:process';
import {authenticate} from '@google-cloud/local-auth';
import {google} from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];

const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

async function listMessages() {
    const auth = await authenticate({
        scopes: SCOPES,
        keyfilePath: CREDENTIALS_PATH,
    });
    const sheets = google.sheets({version: 'v4', auth});

    const table = sheets.spreadsheets.values.get({
            spreadsheetId: '1hZOouz5RHwmx8SbJyQa957MG2DTa0UuOPecGsFQygbk',
            range: 'F:F'
        });

    const rows = table.data.values;
    console.log(rows)
}

await listMessages();


