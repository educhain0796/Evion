const { createHash } = require('crypto');
const fs = require('fs');

function getMediaHash(filePath) {
    const fileBuffer = fs.readFileSync(filePath);
    const hash = createHash('sha256').update(fileBuffer).digest('hex');
    return '0x' + hash; // prepend 0x for Ethereum-style hex
}

// Example usage:
const mediaHash = getMediaHash('D:\\workspace\\story\\nft\\typescript-tutorial\\mk.jpg');
console.log('Media Hash:', mediaHash);
