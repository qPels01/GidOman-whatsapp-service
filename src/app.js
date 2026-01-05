import { MessageController } from "./messenger.js";
import { SheetsController } from "./sheets.js";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import crypto from 'crypto'
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const credentialsSheets = {
    SCOPES: [
        'https://www.googleapis.com/auth/spreadsheets.readonly',
        ],
    CREDENTIALS_PATH: join(__dirname, '../data/credentials.json'),
}

const sheetsValues = {
    sheetId: process.env.SHEET_ID,
    sheetRange: 'Working!G2:M',
}

const messegerController = new MessageController(process.env.API_URL, process.env.WABA_API_KEY, process.env.CHANNEL_ID)
const sheetsController = new SheetsController(credentialsSheets)

async function checkAndNotify() {
    const data = await sheetsController.pollSheets(sheetsValues.sheetId, sheetsValues.sheetRange)
    console.log(data)

    if (!data){
        console.log('No changes, nothing to send');
        return
    }

    try {
        for (let tourData of data) {
            const phone = tourData[2];
            if (!phone) continue;
            
            const tour = tourData[0];
            const hotel = tourData[4];

            const rowId = crypto.createHash('md5').update(`${phone}|${tour}`).digest('hex');

            const image = tourData[5]

            await messegerController.sendText(phone, image, tour, hotel, rowId, process.env.MESSAGE_TEMPLATE_ID)
        }
    } catch (err) {
        console.error(err) 
    }

}

const INTERVAL_MS = 60 * 1000;

async function worker() {
    await messegerController.initProcessed();
    while (true) {
        try {
            await checkAndNotify();
        } catch (err) {
            console.error('checkAndNotify error:', err);
        }
        await new Promise(res => setTimeout(res, INTERVAL_MS));
    }
}

await worker();