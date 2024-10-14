// src/FileUpload.js
import React, { useState } from 'react';
import axios from 'axios';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleEncrypt = async () => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:3001/api/encryption/encrypt', formData, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `encrypted_${file.name}`);
      document.body.appendChild(link);
      link.click();
      setMessage('File encrypted successfully.');
    } catch (error) {
      console.error('Error encrypting the file:', error);
      setMessage('Error encrypting the file.');
    }
  };

  const handleDecrypt = async () => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:3001/api/encryption/decrypt', formData, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `decrypted_${file.name}`);
      document.body.appendChild(link);
      link.click();
      setMessage('File decrypted successfully.');
    } catch (error) {
      console.error('Error decrypting the file:', error);
      setMessage('Error decrypting the file.');
    }
  };

  return (
    <div>
      <h1>File Encryption and Decryption</h1>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleEncrypt}>Encrypt</button>
      <button onClick={handleDecrypt}>Decrypt</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default FileUpload;
