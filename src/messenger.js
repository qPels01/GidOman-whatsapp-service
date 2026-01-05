import { promises as fs } from 'fs';
import axios from 'axios'
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const FILE_PATH = join(__dirname, '../data/processed.json');

export class MessageController{
    processedRows = new Set();

    constructor(apiURL, apiKey, channelId){
        this.apiURL = apiURL
        this.apiKey = apiKey
        this.channelId = channelId
    }

        async initProcessed() {
        try {
            const file = await fs.readFile(FILE_PATH, 'utf8');
            this.processedRows = new Set(JSON.parse(file));
        } catch {}
    }

    async markProcessed(rowId) {
        this.processedRows.add(rowId);
        await fs.writeFile(FILE_PATH, JSON.stringify([...this.processedRows]), 'utf8');
    }

    async wasProcessed(rowId) {
        return this.processedRows.has(rowId);
    }

        async sendText(phone, fileURL, tour, hotel, rowId, templateId) {
        try {
            if (!(await this.wasProcessed(rowId))){
                const req = await axios.post(this.apiURL,
                    {
                        channelId: this.channelId,
                        chatType: "whatsapp",
                        chatId: phone,
                        templateId: templateId,
                        templateValues: [fileURL, tour, hotel]
                    }, 
                    {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${this.apiKey}`,
                        },
                    }
                );
                if (req.status >= 200 && req.status < 300){
                    console.log('Message sended:', req.status)
                    await this.markProcessed(rowId);
                    return true
                }
            }
        } catch (error) {
            console.error('[MessageController] Message error:', {
                message: error.message,
                code: error.response?.status,
                stack: error.stack,
                data: error.response?.data
            });
        }
    }
    async sendImage(phone, fileURL, imageNumber, rowId, templateId) {
        try {
            if (!(await this.wasProcessed(rowId))){
                const req = await axios.post(this.apiURL,
                        {
                            channelId: this.channelId,
                            chatType: "whatsapp",
                            chatId: phone,
                            templateId: templateId,
                            templateValues: [fileURL, String(imageNumber)]
                        }, 
                        {
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${this.apiKey}`,
                            },
                        }
                    );
                    if (req.status >= 200 && req.status < 300){
                        console.log('Message sended:', req.status)
                        await this.markProcessed(rowId);
                        return true
                    }
            }

        } catch (error) {
            console.error('[MessageController] Message with image error:', {
                message: error.message,
                code: error.response?.status,
                stack: error.stack,
                data: error.response?.data
            });
        }
    }

    async addUser(username, phone){

    }

}
