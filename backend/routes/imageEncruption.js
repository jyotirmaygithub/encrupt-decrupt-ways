const express = require('express');
const router = express.Router();
const Jimp = require('jimp');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// Helper functions for encoding and decoding
const toBin = (data) => {
    return data
        .split('')
        .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
        .join('');
};

const binToString = (bin) => {
    const bytes = bin.match(/.{1,8}/g);
    return bytes.map(byte => String.fromCharCode(parseInt(byte, 2))).join('');
};

// Encode image route
router.post('/encodeImage', upload.single('image'), async (req, res) => {
    const { message } = req.body;
    const binaryMessage = toBin(message) + toBin('###');

    try {
        const image = await Jimp.read(req.file.buffer);
        const { width, height } = image.bitmap;
        const requiredBits = (binaryMessage.length) * 3; // 3 bits for RGB
        const availableBits = width * height * 3;

        if (availableBits < requiredBits) {
            return res.status(400).send({ error: 'Image is too small to encode the message.' });
        }

        let dataIndex = 0;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (dataIndex >= binaryMessage.length) break;

                const pixelColor = Jimp.intToRGBA(image.getPixelColor(x, y));
                pixelColor.r = (pixelColor.r & ~1) | parseInt(binaryMessage[dataIndex], 2);
                if (dataIndex + 1 < binaryMessage.length) {
                    pixelColor.g = (pixelColor.g & ~1) | parseInt(binaryMessage[dataIndex + 1], 2);
                }
                if (dataIndex + 2 < binaryMessage.length) {
                    pixelColor.b = (pixelColor.b & ~1) | parseInt(binaryMessage[dataIndex + 2], 2);
                }

                image.setPixelColor(Jimp.rgbaToInt(pixelColor.r, pixelColor.g, pixelColor.b, pixelColor.a), x, y);
                dataIndex += 3;
            }
        }

        const buffer = await image.getBufferAsync(Jimp.MIME_PNG);
        res.set('Content-Type', Jimp.MIME_PNG);
        res.send(buffer);
    } catch (error) {
        console.error(error); // Log error for debugging
        res.status(500).send({ error: 'An error occurred while encoding the image.' });
    }
});

// Decode image route
router.post('/decodeImage', upload.single('image'), async (req, res) => {
    try {
        const image = await Jimp.read(req.file.buffer);
        const { width, height } = image.bitmap;
        let binaryData = '';

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const pixelColor = Jimp.intToRGBA(image.getPixelColor(x, y));
                binaryData += (pixelColor.r & 1).toString();
                binaryData += (pixelColor.g & 1).toString();
                binaryData += (pixelColor.b & 1).toString();
            }
        }

        const bytes = binaryData.match(/.{1,8}/g);
        let decodedMessage = '';
        for (let byte of bytes) {
            const char = String.fromCharCode(parseInt(byte, 2));
            decodedMessage += char;
            if (decodedMessage.slice(-3) === '###') {
                decodedMessage = decodedMessage.slice(0, -3); // Remove termination sequence
                break;
            }
        }

        if (decodedMessage.length === 0) {
            return res.status(404).send({ message: 'No message found in the image.' });
        }
        res.send({ message: decodedMessage });
    } catch (error) {
        console.error(error); // Log error for debugging
        res.status(500).send({ error: 'An error occurred while decoding the image.' });
    }
});

module.exports = router;
