import { useCallback, useEffect, useState } from "react";
import { createWorker, PSM } from "tesseract.js";
import "./App.css";

const WHITELIST_LETTERS =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz/' '";

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [Name, setName] = useState("");
  const [DOB, setDOB] = useState("");
  const [Expiration, setExpiration] = useState("");

  const processData = (data) => {
    console.log(data.lines);
    let Name = " ";
    let Dob = " ";
    let exp = " ";

    data.lines[1].words.map((word) => (Name += word.text + " "));
    data.lines[2].words.map((word) => (Name += word.text + " "));
    data.lines[4].words.map((word) => (Dob += word.text + " "));
    data.lines[6].words.map((word) => (exp += word.text + " "));

    setName(Name);
    setDOB(Dob);
    setExpiration(exp);
  };

  const convertImageToText = useCallback(async () => {
    const worker = await createWorker("eng", 1, {
      legacyCore: true,
      legacyLang: true,
    });
    const whitlist = await worker.setParameters({
      tessedit_char_whitelist: WHITELIST_LETTERS,
      tessedit_pageseg_mode: PSM.SINGLE_COLUMN,
      preserve_interword_spaces: 1,
    });

    if (!selectedImage) return;
    const { data } = await worker.recognize(selectedImage, {
      rectangle: { top: 60, left: 100, width: 215, height: 160 },
    });
    processData(data);
    await worker.terminate();
  }, [selectedImage]);

  useEffect(() => {
    convertImageToText();
  }, [selectedImage, convertImageToText]);

  const handleChangeImage = (e) => {
    if (e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    } else {
      setSelectedImage(null);
    }
  };

  return (
    <div className="App">
      <h1>Image Scan</h1>
      <p>Gets words in image!</p>
      <div className="input-wrapper">
        <label htmlFor="upload">Upload Image</label>
        <input
          style={{ textAlign: "end" }}
          label="none"
          type="file"
          id="upload"
          accept="image/*"
          onChange={handleChangeImage}
        />
      </div>

      <div className="result">
        {selectedImage && (
          <div className="box-image">
            <img src={URL.createObjectURL(selectedImage)} alt="thumb" />
          </div>
        )}

        {Name && (
          <div className="box-p">
            <p>Name:{Name}</p>
            <p>Date Of Birth:{DOB}</p>
            <p>Expiration:{Expiration}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
