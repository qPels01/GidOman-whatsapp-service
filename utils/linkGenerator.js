// Работает ссылками типа: https://drive.google.com/file/d/<fileID>/view?usp=drive_link

export function generateLink(link){
    const fileId = link.replace('https://drive.google.com/file/d/', '').split('/')[0]
    const newLink = `https://drive.google.com/uc?export=download&id=${fileId}`
    return newLink
}