import React, { useState } from 'react';
import axios from 'axios';

const ImageSteganography = () => {
    const [message, setMessage] = useState('');
    const [decodedMessage, setDecodedMessage] = useState('');
    const [image, setImage] = useState(null);
    const [encodedImage, setEncodedImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleEncode = async () => {
        const formData = new FormData();
        formData.append('image', image);
        formData.append('message', message);

        setLoading(true);
        setError('');

        try {
            const response = await axios.post('http://localhost:3001/api/imageEncruption/encodeImage', formData, {
                responseType: 'blob'
            });
            setEncodedImage(URL.createObjectURL(response.data));
            setDecodedMessage(''); // Clear previous decoded message
        } catch (error) {
            console.error(error);
            setError('Failed to encode the message into the image. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDecode = async () => {
        const formData = new FormData();
        formData.append('image', image);

        setLoading(true);
        setError('');

        try {
            const response = await axios.post('http://localhost:3001/api/imageEncruption/decodeImage', formData);
            setDecodedMessage(response.data.message);
        } catch (error) {
            console.error(error);
            setError('Failed to decode the message from the image. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>Image Steganography</h1>
            <input 
                type="file" 
                accept="image/*" 
                onChange={e => setImage(e.target.files[0])} 
            />
            <textarea 
                value={message} 
                onChange={e => setMessage(e.target.value)} 
                placeholder="Enter message to encode" 
            />
            <button onClick={handleEncode} disabled={loading}>
                {loading ? 'Encoding...' : 'Encode Message'}
            </button>
            <button onClick={handleDecode} disabled={loading || !image}>
                {loading ? 'Decoding...' : 'Decode Message'}
            </button>
            {encodedImage && <img src={encodedImage} alt="Encoded" />}
            {decodedMessage && <p>Decoded Message: {decodedMessage}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default ImageSteganography;
