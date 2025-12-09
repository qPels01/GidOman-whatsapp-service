import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const getImageDataAsBase64 = () => {
    const filePath = path.join(__dirname, '..', '/images', '1.jpg')
    const fileContent = fs.readFileSync(filePath)
    const blob = new Blob([fileContent], {type: 'image/jpg'})
    return blob
}
