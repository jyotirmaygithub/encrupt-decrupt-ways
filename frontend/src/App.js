import React from "react";
import FileUploader from "./FileUpload";
import ImageSteganography from "./ImageSteganography";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <>
          <Router>
            <Routes>
              <Route exact path="/" element={<FileUploader />} />
              <Route exact path="/image" element={<ImageSteganography />} />         
            </Routes>
          </Router>
    </>
  );
}

export default App;
