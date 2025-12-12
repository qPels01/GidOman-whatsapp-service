import { GreenApiClient } from '@green-api/whatsapp-api-client-js-v2';
import dotenv from 'dotenv';
import PQueue from 'p-queue';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({path: '../.env'});

const FILE_PATH = join(__dirname, '../processed.json');

const queue = new PQueue({ concurrency: 1, interval: 2000, intervalCap: 1 });

export class MessageController{
    processedRows = new Set();

    constructor(credentials){
        this.credentials = credentials

        this.client = new GreenApiClient({
                idInstance: this.credentials.id,
                apiTokenInstance: this.credentials.token
            });
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

    async sendText(phone, text, rowId) {
        const chatId = `${phone}@c.us`;
        try {
            if (!(await this.wasProcessed(rowId))){
                await this.markProcessed(rowId);
                return queue.add(() => this.client.sendMessage({ chatId, message: text }));
            }
        } catch (error) {
            console.error('[MessageController] Ошибка при отправке сообщения:', {
                message: error.message,
                code: error.code,
                stack: error.stack,
            });
        }
    }

    async sendImage(phone, base64Data, fileName, caption = '', rowId) {
        const chatId = `${phone}@c.us`;
        try {
            if (!(await this.wasProcessed(rowId))){
                await this.markProcessed(rowId);
                return queue.add(() =>
                    this.client.sendFileByUpload({
                        chatId,
                        file: { data: base64Data, fileName },
                        caption,
                    })
                );
            }

        } catch (error) {
            console.error('[MessageController] Ошибка при отправке сообщения с изображением:', {
                message: error.message,
                code: error.code,
                stack: error.stack,
            });
        }

    }
}

// const credentials = {
//     id: process.env.WHATSAPP_API_INSTANCE_ID,
//     token: process.env.WHATSAPP_API_TOKEN_INSTANCE
// }

// const Messenger = new MessageController(credentials)

// Messenger.sendText('79103577107', 'aSDA!', 'sadq23q112asd')