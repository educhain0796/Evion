import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import dotenv from 'dotenv';

dotenv.config();

async function uploadToPinata() {
  try {
    const filePath = 'D:\\workspace\\story\\nft\\typescript-tutorial\\mk.jpg';
    const fileStream = fs.createReadStream(filePath);

    // Build form-data
    const formData = new FormData();
    formData.append('file', fileStream);

    const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';

    const response = await axios.post(url, formData, {
      maxContentLength: Infinity,
      headers: {
        ...formData.getHeaders(), // <-- includes boundary automatically
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
      },
    });

    console.log('File uploaded to IPFS via Pinata:');
    console.log('CID:', response.data.IpfsHash);
  } catch (error) {
    console.error('Error uploading file:', error.response?.data || error.message);
  }
}

uploadToPinata();
