import { promises as fs } from 'fs';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const FILE_PATH = join(__dirname, '../data/processed.json');

export class MessageController {
    processedRows = new Set();

    constructor(apiURL, apiKey, channelId) {
        this.apiURL = apiURL;
        this.apiKey = apiKey;
        this.channelId = channelId;
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

    async sendTemplate({ phone, hotel, rowId, templateId }) {
        if (!templateId) {
            console.warn('[MessageController] No templateId, skip send', { phone, rowId });
            return false;
        }
        const values = hotel ? [hotel] : [];

        try {
            if (!(await this.wasProcessed(rowId))) {
                const payload = {
                    channelId: this.channelId,
                    chatType: 'whatsapp',
                    chatId: phone,
                    templateId,
                    templateValues: values,
                };

                // console.log('[DEBUG] Payload:', JSON.stringify(payload, null, 2));
                const req = await axios.post(
                    this.apiURL,
                    {
                        channelId: this.channelId,
                        chatType: 'whatsapp',
                        chatId: phone,
                        templateId: templateId,
                        templateValues: values,
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${this.apiKey}`,
                        },
                    }
                );
                if (req.status >= 200 && req.status < 300) {
                    console.log({ message: 'message sent', status: req.status, date: String(new Date()) });
                    await this.markProcessed(rowId);
                    return true;
                }
            }
        } catch (error) {
            console.error('[MessageController] Message error:', JSON.stringify(error.response?.data ?? error.message, null, 2));
        }
    }
}
