const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'rslt');

try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    const total = data.length;
    const withWhatsapp = data.filter(item => item.hasWhatsapp).length;
    const withoutWhatsapp = total - withWhatsapp;
    const ratio = total > 0 ? (withWhatsapp / total * 100).toFixed(2) : 0;

    console.log(`--- WhatsApp Stats ---`);
    console.log(`Total phones:     ${total}`);
    console.log(`With WhatsApp:    ${withWhatsapp}`);
    console.log(`Without WhatsApp: ${withoutWhatsapp}`);
    console.log(`Ratio:            ${ratio}%`);
    console.log(`----------------------`);
} catch (error) {
    console.error('Error processing file:', error.message);
}
