import { MessageController } from "./messenger.js";
import { SheetsController } from "./sheets.js";
import { generateLink } from "../utils/linkGenerator.js";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import crypto from 'crypto'
import dotenv from 'dotenv';
import { getRandomTemplate } from "../utils/tempaltesRandomazer.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
    sheetRange: 'Лист1!A2:L',
}

const messegerController = new MessageController(credentialsMessenger)
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
            const phone = tourData[7];
            if (!phone) continue;
            
            const tour = tourData[5] || '-';
            const hotel = tourData[9] || '-';

            const date = tourData[0] || '-'

            const rowId = crypto.createHash('md5').update(`${phone}|${date}|${tour}`).digest('hex');

            const text = getRandomTemplate(tour, hotel)
            
            const images = tourData[10].split(',').map(link => link.trim()) || '-'

            await messegerController.sendText(phone, text, rowId)

            if (images.length !== 0 || images !== '-'){
                let idx = 1
                for(let link of images){
                    if (!link || link === '-') continue;
                    const newLink = generateLink(link)
                    const imageName = `image${idx}.jpg`
                    const rowIdImage = crypto.createHash('md5').update(`${phone}|${date}|${link}`).digest('hex');
                    await messegerController.sendImage(phone, newLink, imageName, rowIdImage)
                    idx += 1
                }   
            }
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