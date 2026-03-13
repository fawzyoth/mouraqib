import fs from 'fs';

const srcPath = '/Users/super/PycharmProjects/mouraqib/temp/src';
const tgtPath = '/Users/super/PycharmProjects/mouraqib/temp/tgt';

try {
    // Read and parse the source file
    const srcContent = fs.readFileSync(srcPath, 'utf8');
    const srcData = JSON.parse(srcContent);

    // Extract phone numbers and prepend +216
    const phoneNumbers = srcData
        .map(item => item.phone_number)
        .filter(phone => phone) // Ensure phone exists
        .map(phone => `+216${phone}`);

    // Prepare the target format (object with phone_numbers array as seen in temp/tgt)
    const output = {
        phone_numbers: phoneNumbers
    };

    // Write to the target file
    fs.writeFileSync(tgtPath, JSON.stringify(output, null, 4));

    console.log(`Successfully processed ${phoneNumbers.length} numbers and saved to ${tgtPath}`);
} catch (error) {
    console.error('Error processing phone numbers:', error.message);
    process.exit(1);
}
