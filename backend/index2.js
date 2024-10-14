const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const cors = require('cors'); // Import CORS

const app = express();
const port = 3001;

// Enable CORS for all routes
app.use(cors());

const upload = multer({ dest: 'uploads/' });

function generateKey() {
    return crypto.randomBytes(32); // 32 bytes for AES-256
}

function saveKey() {
    const key = generateKey();
    fs.writeFileSync('secret.key', key);
}

function loadKey() {
    return fs.readFileSync('secret.key');
}

function encryptFile(filePath) {
    const key = loadKey();
    const iv = crypto.randomBytes(16); // Initialization vector

    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

    const fileData = fs.readFileSync(filePath);
    let encryptedData = cipher.update(fileData);
    encryptedData = Buffer.concat([encryptedData, cipher.final()]);

    const authTag = cipher.getAuthTag();

    // Save the encrypted file with IV and auth tag
    const encryptedFilePath = `encrypted_${path.basename(filePath)}`;
    fs.writeFileSync(encryptedFilePath, Buffer.concat([iv, authTag, encryptedData]));

    return encryptedFilePath;
}

function decryptFile(filePath) {
    const key = loadKey();
    const fileData = fs.readFileSync(filePath);

    const iv = fileData.slice(0, 16); // First 16 bytes for IV
    const authTag = fileData.slice(16, 32); // Next 16 bytes for auth tag
    const encryptedData = fileData.slice(32); // Remaining bytes for encrypted data

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    let decryptedData;
    try {
        decryptedData = Buffer.concat([decipher.update(encryptedData), decipher.final()]);
    } catch (err) {
        throw new Error('Decryption failed: Invalid key or corrupted file');
    }

    const decryptedFilePath = `decrypted_${path.basename(filePath)}`;
    fs.writeFileSync(decryptedFilePath, decryptedData);

    return decryptedFilePath;
}

// Endpoint to encrypt the file
app.post('/encrypt', upload.single('file'), (req, res) => {
    const encryptedFilePath = encryptFile(req.file.path);
    res.download(encryptedFilePath, () => {
        // Clean up temporary files after download
        fs.unlinkSync(req.file.path);
        fs.unlinkSync(encryptedFilePath);
    });
});

// Endpoint to decrypt the file
app.post('/decrypt', upload.single('file'), (req, res) => {
    try {
        const decryptedFilePath = decryptFile(req.file.path);
        res.download(decryptedFilePath, () => {
            // Clean up temporary files after download
            fs.unlinkSync(req.file.path);
            fs.unlinkSync(decryptedFilePath);
        });
    } catch (err) {
        res.status(500).send('Error during decryption: ' + err.message);
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    saveKey(); // Save the key once when the server starts
});
