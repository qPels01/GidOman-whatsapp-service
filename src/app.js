import { MessageController } from "./messenger.js";
import { SheetsController } from "./sheets.js";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import * as fs from 'node:fs/promises';
import crypto from 'crypto'
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TOURS_PATH = join(__dirname, "../data/tours.json");

const credentialsSheets = {
    SCOPES: [
        'https://www.googleapis.com/auth/spreadsheets.readonly',
        ],
    CREDENTIALS_PATH: join(__dirname, '../credentials.json'),
}

const sheetsValues = {
    sheetId: process.env.SHEET_ID,
    sheetRange: 'Working!C2:N',
}

const messegerController = new MessageController(process.env.API_URL, process.env.WABA_API_KEY, process.env.CHANNEL_ID)
const sheetsController = new SheetsController(credentialsSheets)

async function checkAndNotify() {
    const data = await sheetsController.pollSheets(sheetsValues.sheetId, sheetsValues.sheetRange)
    console.log(data)

    if (!data){
        console.log('No changes, nothing to send');
        return;
    }

    let toursList = {};

    try {
        toursList = JSON.parse(await fs.readFile(TOURS_PATH, 'utf8'));
    } catch (error) {
        console.error("Error with reading JSON", error);
        return;
    }

    try {
        for (let tourData of data) {
            const phone = tourData[6];
            if (!phone) continue;

            const tourName = tourData[4] ?? ""; 
            const hotel = tourData[8] ?? "";
            const website = tourData[11] ?? "";
            const review = tourData[12] ?? "";

            const rowId = crypto.createHash('md5').update(JSON.stringify(tourData)).digest('hex');

            const hasMeetingPoint = hotel.toLowerCase().includes("meeting point");

            const matchKey = Object.keys(toursList).find((k) => tourName.includes(k));
            if (!matchKey) {
            console.warn("No tour config for:", tourName);
            continue;
            }

            const cfg = toursList[matchKey];

            const templateId = hasMeetingPoint
                ? cfg.with_meeting_point.templateID
                : cfg.with_pickup_hotel.templateID;

            await messegerController.sendTemplate({
                phone,
                hotel,
                rowId,
                templateId,
                review,
                website,
            });
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