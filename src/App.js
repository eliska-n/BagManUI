import { Routes, Route } from "react-router-dom";
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';

import { Base64 } from 'js-base64';
import axios from 'axios';



// TODO - kde by tohle mělo bydlet?
if (!("TextEncoder" in window)) 
  alert("Sorry, this browser does not support TextEncoder...");
if (!("TextDecoder" in window))
  alert("Sorry, this browser does not support TextDecoder...");




function FunPage() {
  return (
    <section id="fun-page">
    <h2>How It Works</h2>
    <p>
      Explain the process of generating the URL and accessing the password.
    </p>
  </section>
  );
}

function SaveNoteScreen() {

  const [note, setNote] = useState(''); // to keep note being written into the text area
  const [url, setUrl] = useState(null); // to picture the url on UI
  const [disabledTextArea, setTextAreaDisabled] = useState(false) // to disable text area when save button is hit
  const [toggleOn, setToggle] = useState(true) // to change save button into start again button
  const [expiration, setExpiration] = useState(0.5) // to set the time to delete the secret note on BE

  const saveNote = async () => {

    const Uint8ArrayToBase64 = (array) => {
      return Base64.fromUint8Array(array, true);
    };

    // Make the textArea read only
    setTextAreaDisabled(true)

    // Generate AES key
    let key = await window.crypto.subtle.generateKey(
      {
        name: "AES-GCM",
        length: 256,
      },
      true,
      ["encrypt", "decrypt"]
    );

    // Encode AES into base64
    const keyExported = await window.crypto.subtle.exportKey("raw", key);
    let keyBase64 = Uint8ArrayToBase64(new Uint8Array(keyExported))  // Use js-base64 library for URL safe encoding

    // Generate iv
    const iv = window.crypto.getRandomValues(new Uint8Array(12)); 
    // translate iv to base64
    // It becomes part of the URL
    // It becomes id of the record in BE database
    const ivBase64 = Uint8ArrayToBase64(iv);  // Use js-base64 library for URL safe encoding

    // Encrypt the secret note
    const encoder = new TextEncoder("utf-8");
    const encodedNote = encoder.encode(note);

    let encryptedNote = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      key,
      encodedNote
    );

    // encrypted note to base64
    let encryptedNoteBase64 = Uint8ArrayToBase64(new Uint8Array(encryptedNote));  // Use js-base64 library for URL safe encoding

    // send to BE
    const client = axios.create({
      baseURL: "/api",
    });

    try {
      let resp = await client.post("/save-password", {id: ivBase64, secret: encryptedNoteBase64, expiration: expiration*60*60});
      if (resp.data.result !== "OK") {
        // do something
      }

    } catch (error) {
      console.error(error)
    }
    // show the URL to share the secret note
    setUrl(window.location.origin + "/#/" + ivBase64 + "/" + keyBase64)
    setToggle(false)
  }

  const startAgain = () => {
    setNote("")
    setTextAreaDisabled(false)
    setUrl(null)
    setToggle(true)
    setExpiration(0.5)
  };

  const copyURLToClipboard = () => {
    navigator.clipboard.writeText(url)
  };

  return (
    <>
      <div className="row py-5 justify-content-center">
        <div className="col-4 col-lg-3">
          <img src="./pssst.png" style={{maxWidth: "100%", maxHeight: "100%", objectFit: "contain"}}></img>
        </div>
      </div>
      <div className="row py-5 justify-content-center">
        <div className="col-12 col-lg-6">

          <div className="card">
            <div className="card-header">
              Save the secret
            </div>
            <div className="card-body">
              {toggleOn === true &&
                <>
                <h1 className="card-title">Enter a secret note</h1>
                <form id="password-entry">
                  <textarea id="text-area" disabled={disabledTextArea} className="form-control card-text" value={note} onChange={(event) => {setNote(event.target.value);}} rows="4" cols="20"></textarea>
                  <label htmlFor="expiration" className="card-text">Set the expiration of the secret note</label>
                  <input id="expiration" type="range" disabled={disabledTextArea} className="form-range" value={expiration} onChange={(event) => {setExpiration(event.target.value);}} min="0" max="24" step="0.25"></input>
                  <p className="small card-text"> Expiration set to {(expiration | 0)} hours and {(expiration - (expiration | 0)) * 60} minutes.</p>
                  <button className="btn btn-primary" type="button" onClick={saveNote}>Save Note</button>
                </form>
                </>
              }

              {toggleOn === false &&
                <>
                <h1 className="card-title">Share the secret with this URL</h1>
                <p className="small card-text">{url}</p>
                <div className="d-grid gap-2 col-lg-6 mx-auto">
                  <button className="btn btn-primary" type="button" onClick={copyURLToClipboard}>Copy URL to clipboard</button>
                  <button className="btn btn-primary btn-sm" type="button" onClick={startAgain}>Start Again</button>
                </div>
                </>
              }
            </div>
          </div>

        </div>
      </div>
    </>
  );
}



function DisplayNoteScreen() {
  const { iv, aes } = useParams();
  const [note, setNote] = useState(null);
  const [showNote, setShow] = useState(false);

  const revealSecret = async () => {

    let secretNote = null
    const fetchData = async () => {
      let resp = null
      try {
        resp = await axios.get("/api/get-password", { params: { id: iv } })
        return resp.data.data.secret
      }
      catch (error) {
        if (error.request.status === 410) {
          console.log("Requested password not found")
        } else {
          console.log("error in BE call")
          console.error(error)
        }
        return null
      }
    };

    const Base64ToUint8Array = (base64) => {
      return Base64.toUint8Array(base64, true);
    };

    let resp = await fetchData();
    if ( resp !== null ) {
      let encryptedNote = Base64ToUint8Array(resp);  // base64 to encrypted array
      let decodedAES = Base64ToUint8Array(aes);  // base64 AES key to array
      let decodedIV = Base64ToUint8Array(iv);  // base64 AES key to array
      decodedAES = await window.crypto.subtle.importKey("raw", decodedAES, "AES-GCM", true, ["encrypt", "decrypt"])

      let decryptedNote = await window.crypto.subtle.decrypt({ name: "AES-GCM", iv: decodedIV }, decodedAES, encryptedNote);  // encrypted array to decrypted array

      const decoder = new TextDecoder("utf-8");
      secretNote = decoder.decode(decryptedNote);
    }

    setNote(secretNote)
    setShow(true)
  };

  const copySecretToClipboard = () => {
    navigator.clipboard.writeText(note)
  };

  return (
    <>
      <div className="row py-5 justify-content-center">
        <div className="col-12 col-lg-6">

          {showNote === false &&
            <button className="btn btn-primary" type="button" onClick={revealSecret}>Reveal the secret</button>
          }


            {note === null && showNote === true &&
              <div className="card">
                <div className="card-header">
                  Secret note was not found :( 
                </div>
                <div className="card-body">
                  <h5 className="card-title">Sorry, I cannot reveal the secret.</h5>
                </div>
              </div>
            }

            {note != null && showNote === true &&
              <div className="card">
                <div className="card-header">
                  Here is your super secret note!
                </div>
                <div class="card-body">
                  <h5 className="card-title">{note}</h5>
                  <button className="btn btn-success" onClick={copySecretToClipboard}>Copy secret to clipboard</button>
                </div>
              </div>
            }

        </div>
      </div>

    </>
  );
}

function BagmanRouter() {
  return(
    <Routes>
      <Route index element={< SaveNoteScreen />} />
      <Route path="/:iv/:aes" element={<DisplayNoteScreen />} />
    </Routes>
  )
}


function App() {

  return (
    <div className="container text-center">
        <BagmanRouter />
    </div>
  );
}

export default App;

