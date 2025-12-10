import { GreenApiClient } from '@green-api/whatsapp-api-client-js-v2';
import dotenv from 'dotenv';
import { getImageDataAsBase64 } from './utils/filePathGenerator.js';
import { pollSheets } from './sheets.js';

dotenv.config();

const client = new GreenApiClient({
    idInstance: process.env.WHATSAPP_API_INSTANCE_ID,
    apiTokenInstance: process.env.WHATSAPP_API_TOKEN_INSTANCE
});

async function messageSender() {
    const phoneNumber = '79103577107';
    const imgURL = getImageDataAsBase64()

    // const res = await client.sendMessage({
    //     chatId: `${phoneNumber}@c.us`,
    //     message: 'This is my message to my master:',
    // });

    const res = await client.sendFileByUpload({
        chatId: `${phoneNumber}@c.us`,
        file: {
            data: imgURL,
            fileName: '1.jpg'
        },
        caption: 'Мяу'
})

}


console.log(res)