import { MessageController } from "./messenger.js";
import { SheetsController } from "./sheets.js";
import { normalizeTime } from "../utils/timeNormalizer.js";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import crypto from 'crypto'
import dotenv from 'dotenv';
import { getRandomTemplate } from "../utils/tempaltesRandomazer.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// console.log(process.env.WHATSAPP_API_INSTANCE_ID)

const credentialsMessenger = {
    id: process.env.WHATSAPP_API_INSTANCE_ID,
    token: process.env.WHATSAPP_API_TOKEN_INSTANCE
}

const credentialsSheets = {
    SCOPES: [
        'https://www.googleapis.com/auth/spreadsheets.readonly',
        ],
    CREDENTIALS_PATH: join(__dirname, '../credentials.json'),
}

const sheetsValues = {
    sheetId: '1hZOouz5RHwmx8SbJyQa957MG2DTa0UuOPecGsFQygbk',
    sheetRange: 'Лист1!A2:J',
}

const messegerController = new MessageController(credentialsMessenger)
const sheetsController = new SheetsController(credentialsSheets)

async function checkAndNotify() {
    const data = await sheetsController.pollSheets(sheetsValues.sheetId, sheetsValues.sheetRange)

    if (!data){
        console.log('No changes, nothing to send');
        return;
    }
    try {
        for (let tourData of data) {
            const phone = tourData[6];
            if (!phone) continue;

            const tour = tourData[4] || '-';
            const hotel = tourData[8] || '-';
            const formattedTime = normalizeTime(tourData[7]);
            const date = tourData[0] || '-'

            const rowId = crypto.createHash('md5').update(`${phone}|${date}|${tour}`).digest('hex');

            const text = getRandomTemplate(tour, hotel, date, formattedTime)

            await messegerController.sendText(phone, text, rowId)
        }
    } catch (err) {
        
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