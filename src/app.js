import { MessageController } from "./messenger.js";
import { SheetsController } from "./sheets.js";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { TourSorter } from "../utils/tour.sort.js";
import * as fs from 'node:fs/promises';
import { createHash } from "node:crypto";
import dotenv from 'dotenv';
import { read } from "node:fs";

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
    sheetRange: ['direct booking!C2:N'],
}

const messegerController = new MessageController(process.env.API_URL, process.env.WABA_API_KEY, process.env.CHANNEL_ID)
const sheetsController = new SheetsController(credentialsSheets)

let toursList = {};

try {
    toursList = JSON.parse(await fs.readFile(TOURS_PATH, 'utf8'));
} catch (error) {
    console.error("Error with reading JSON", error);
}

const sorter = new TourSorter(toursList)

async function checkAndNotify() {
    const data = await sheetsController.pollSheets(sheetsValues.sheetId, sheetsValues.sheetRange)

    if (!data){
        console.log('No changes, nothing to send');
        return;
    }

    try {
        for (let tourData of data) {
            // console.log("len:", tourData.length, "ready:", tourData[10], "review:", tourData[11]);
            const phone = tourData[6];
            if (!phone) continue;

            const custumerName = tourData[1] ?? "";
            const date = tourData[0] ?? "";
            const tourName = tourData[4] ?? ""; 
            const hotel = tourData[8] ?? "";
            const ready = tourData[10] ?? ""
            const review = tourData[11] ?? "";

            const hasMeetingPoint = hotel.toLowerCase().includes("meeting point") || !hotel;

            const matchKey = sorter.bestMatchKey(tourName);
            if (!matchKey) {
                console.warn("No tour config for:", tourName);
                continue;
            }

            const cfg = toursList[matchKey];

            const templateId = hasMeetingPoint
                ? cfg.with_meeting_point.templateID
                : cfg.with_pickup_hotel.templateID;
            
            const idSault = phone + hotel + tourName + custumerName + date

            if (typeof ready === "string" && ready.trim().toLowerCase() === "ready"){
                console.log("is ready tour!", tourName)
                const rowId = createHash('md5').update(idSault + "message").digest('hex');
                await messegerController.sendTemplate({ phone, hotel, rowId, templateId });
            }

            if (review){
                if (review === "How was the tour?") {
                    console.log("is review tour!")
                    const rowId = createHash('md5').update(idSault + "How was the tour?").digest('hex');
                    await messegerController.sendTemplate({ phone, rowId, templateId: process.env.REVIEW_MESSAGE });
                } else if (review === "Thank you") {
                    console.log("is thankyou tour!")
                    const rowId = createHash('md5').update(idSault + "Thank you").digest('hex');
                    await messegerController.sendTemplate({ phone, rowId, templateId: process.env.THANKYOU_MESSAGE });
                }
            } 

        }
    } catch (err) {
        if (err.name === "TypeError"){
            if (err.message === "Cannot read properties of undefined (reading 'templateID')"){
                console.error("No tamplate for tour")
            }
        } else{
            console.error(err)
        }
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