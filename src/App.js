import { Routes, Route } from "react-router-dom";
import { useParams } from 'react-router-dom';
import { useState } from 'react';

import { Base64 } from 'js-base64';
import axios from 'axios';

import {UnicornsScreen} from './Unicorns'
import {Navbar} from "./navbar"


// TODO - kde by tohle mělo bydlet?
if (!("TextEncoder" in window)) 
  alert("Sorry, this browser does not support TextEncoder...");
if (!("TextDecoder" in window))
  alert("Sorry, this browser does not support TextDecoder...");


function SaveNoteScreen({ setAlert }) {

  const [note, setNote] = useState(''); // to keep note being written into the text area
  const [url, setUrl] = useState(null); // to picture the url on UI
  const [disabledTextArea, setTextAreaDisabled] = useState(false) // to disable text area when save button is hit
  const [toggleOn, setToggle] = useState(true) // to change save button into start again button
  const [expiration, setExpiration] = useState(4) // to set the time to delete the secret note on BE
  const [burnChecked, setBurnChecked] = useState(false)
  const [passwordGenerator, setPasswordGenerator] = useState(false)
  
  // Password generator states
  const [passwordLength, setPasswordLength] = useState(24);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [beginWithLetter, setBeginWithLetter] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [noSimilarChars, setNoSimilarChars] = useState(false);
  const [noDuplicateChars, setNoDuplicateChars] = useState(false);
  const [noSequentialChars, setNoSequentialChars] = useState(true);

  const expirationTranslationTable = {
    1: {
      seconds: 5*60,
      name: "5 minutes",
    },
    2: {
      seconds: 60*60,
      name: "1 hour",
    },
    3: {
      seconds: 24*60*60,
      name: "1 day",
    },
    4: {
      seconds: 7*24*60*60,
      name: "7 days",
    },
    5: {
      seconds: 30*24*60*60,
      name: "30 days",
    },
    6: {
      seconds: 90*24*60*60,
      name: "90 days",
    },
  }

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

    // set limit of views - if Burn after reading button is checked, make the limit one, if not, make it 100, because BE does not allow infinity, yet.
    let limit = 1
    if (burnChecked === false) {
      limit = 0
    }

    try {
      let resp = await client.post("/note", {id: ivBase64, secret: encryptedNoteBase64, expiration: expirationTranslationTable[expiration].seconds, views_limit: limit});
      if (resp.data.result !== "OK") {
        setAlert("Sorry, the secret note was not saved.")
        return
      }

    } catch (error) {
      setAlert("Sorry, the secret note was not saved.")
      return
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
    setExpiration(4)
    setBurnChecked(false)
    setPasswordGenerator(false)
  };

  const copyURLToClipboard = () => {
    navigator.clipboard.writeText(url)
  };

  const generatePassword = () => {
    let chars = '';
    if (includeNumbers) chars += '0123456789';
    if (includeLowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (includeUppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (noSimilarChars) {
      chars = chars.replace(/[iIlL1oO0]/g, '');
    }

    let password = '';
    const firstChar = beginWithLetter ? 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ' : chars;

    // Generate first character if beginWithLetter is true
    if (beginWithLetter) {
      password += firstChar.charAt(Math.floor(Math.random() * firstChar.length));
    }

    // Generate remaining characters
    while (password.length < passwordLength) {
      const char = chars.charAt(Math.floor(Math.random() * chars.length));
      
      if (noDuplicateChars && password.includes(char)) continue;
      
      if (noSequentialChars && password.length > 0) {
        const lastChar = password[password.length - 1];
        const charCode = char.charCodeAt(0);
        const lastCharCode = lastChar.charCodeAt(0);
        if (Math.abs(charCode - lastCharCode) === 1) continue;
      }
      
      password += char;
    }

    return password;
  };

  const copyGeneratedPassword = () => {
    const passwordField = document.getElementById('generatedPassword');
    passwordField.select();
    document.execCommand('copy');
    setAlert('Password copied to clipboard!');
  };

  return (
    <>
      <div className="row py-3 justify-content-center">
        <div className="col-4 col-lg-3">
          <img src="./img/pssst.png" style={{maxWidth: "100%", maxHeight: "100%", objectFit: "contain"}}></img>
        </div>
      </div>
      <div className="row py-4 justify-content-center">
        <div className="col-12">
          <div className="card shadow" style={{maxWidth: "45rem", margin: "0 auto"}}>
            {toggleOn === true &&
              <>
              <div className="card-header">
                <h1>Create the Secret Note</h1>
              </div>
              <div className="card-body">
                <form id="note-entry">
                  <div className="py-2">
                    <textarea id="text-area" disabled={disabledTextArea} className="form-control card-text font-monospace" value={note} onChange={(event) => { setNote(event.target.value); }} rows="4"></textarea>
                  </div>

                  <div className="row py-2 justify-content-center">
                    <div className="col-12 col-lg-10">
                      <label htmlFor="expiration" className="card-text">Expiration of the Secret Note is <b>{expirationTranslationTable[expiration].name}</b> </label>
                      <input id="expiration" type="range" disabled={disabledTextArea} className="form-range" value={expiration} onChange={(event) => {setExpiration(event.target.value);}} min="1" max="6" step="1"></input>

                      <div className="form-check form-switch">
                        <input className="form-check-input" type="checkbox" role="switch" id="BurnAfterReading"  checked={burnChecked} onChange={() => {setBurnChecked(!burnChecked)}}></input>
                        <label className="form-check-label" htmlFor="BurnAfterReading">Burn the Secret Note after reading</label>
                      </div>
                    </div>
                  </div>

                  <div className="py-2">
                    <button className="btn btn-primary btn-lg" type="button" onClick={saveNote}>🔒 Submit Securely</button>
                  </div>
                  <div className="py-2" hidden={passwordGenerator === true}>
                    <button className="btn btn-link-outline" type="button" onClick={() => {setPasswordGenerator(!passwordGenerator)}}>Password generator</button>
                  </div>

                </form>

                  <div hidden={passwordGenerator === false} style={{padding: "0 10rem"}} className="pt-4">
                    <h3>Password generator</h3>
                    
                    <div className="py-1">
                      <label htmlFor="passwordLength" className="form-label">Password Length</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        id="passwordLength" 
                        min="5" 
                        max="128" 
                        value={passwordLength}
                        onChange={(e) => setPasswordLength(parseInt(e.target.value) || 24)}
                      />
                    </div>
                    
                    <div style={{textAlign: "left"}} className="py-1">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="includeNumbers" 
                        checked={includeNumbers}
                        onChange={(e) => setIncludeNumbers(e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="includeNumbers" style={{paddingLeft: "0.5rem"}} title="Include numbers: 0123456789">
                        Numbers
                      </label>
                    </div>

                    <div style={{textAlign: "left"}} className="py-1">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="includeLowercase" 
                        checked={includeLowercase}
                        onChange={(e) => setIncludeLowercase(e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="includeLowercase" style={{paddingLeft: "0.5rem"}} title="Include lowercase characters: abcdefghijklmnopqrstuvwxyz">
                        Lowercase Characters
                      </label>
                    </div>

                    <div style={{textAlign: "left"}} className="py-1">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="includeUppercase" 
                        checked={includeUppercase}
                        onChange={(e) => setIncludeUppercase(e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="includeUppercase" style={{paddingLeft: "0.5rem"}} title="Include uppercase characters: ABCDEFGHIJKLMNOPQRSTUVWXYZ">
                        Uppercase Characters
                      </label>
                    </div>

                    <div style={{textAlign: "left"}} className="py-1">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="beginWithLetter" 
                        checked={beginWithLetter}
                        onChange={(e) => setBeginWithLetter(e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="beginWithLetter" style={{paddingLeft: "0.5rem"}} title="Begin with a letter, not a number or symbol">
                        Begin With A Letter
                      </label>
                    </div>

                    <div style={{textAlign: "left"}} className="py-1">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="includeSymbols" 
                        checked={includeSymbols}
                        onChange={(e) => setIncludeSymbols(e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="includeSymbols" style={{paddingLeft: "0.5rem"}} title="Include symbols: !@#$%^&*()_+-=[]{}|;:,.<>?">
                        Include Symbols
                      </label>
                    </div>

                    <div style={{textAlign: "left"}} className="py-1">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="noSimilarChars" 
                        checked={noSimilarChars}
                        onChange={(e) => setNoSimilarChars(e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="noSimilarChars" style={{paddingLeft: "0.5rem"}} title="Don't include similar characters: i, I, 1, l, o, O, 0">
                        No Similar Characters
                      </label>
                    </div>

                    <div style={{textAlign: "left"}} className="py-1">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="noDuplicateChars" 
                        checked={noDuplicateChars}
                        onChange={(e) => setNoDuplicateChars(e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="noDuplicateChars" style={{paddingLeft: "0.5rem"}} title="Don't include duplicate characters">
                        No Duplicate Characters
                      </label>
                    </div>

                    <div style={{textAlign: "left"}} className="pt-1 pb-3">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="noSequentialChars" 
                        checked={noSequentialChars}
                        onChange={(e) => setNoSequentialChars(e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="noSequentialChars" style={{paddingLeft: "0.5rem"}} title="Don't include sequential characters (e.g. abc, 123, qwerty, asdfgh)">
                        No Sequential Characters
                      </label>
                    </div>

                    <button className="btn btn-primary" onClick={() => {setNote(generatePassword())}}>Generate Password</button>

                  </div>
              </div>
              </>
            }

            {toggleOn === false &&
              <>
              <div className="card-header">
                <h1>Share the link</h1>
              </div>
              <div className="card-body">
                <p className="small card-text">{url}</p>
                <div className="d-grid gap-2 col-lg-6 mx-auto">
                  <button className="btn btn-primary btn-lg" type="button" onClick={copyURLToClipboard}>Copy URL to clipboard</button>
                  <button className="btn btn-secondary btn-sm" type="button" onClick={startAgain}>Start Again</button>
                </div>
              </div>
              </>
            }

          </div>
        </div>
      </div>
    </>
  );
}



function DisplayNoteScreen( setAlert ) {
  const { iv, aes } = useParams();
  const [note, setNote] = useState(null);
  const [showNote, setShow] = useState(false);
  const [deleted, setDeleted] = useState(false)

  const revealSecret = async () => {

    let secretNote = null
    const fetchData = async () => {
      let resp = null
      try {
        resp = await axios.get(`/api/note/${iv}`)
        return resp.data.data.secret
      }
      catch (error) {
        if (error.request.status === 410) {
          console.log("Requested note not found")
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
      decodedAES = await window.crypto.subtle.importKey("raw", decodedAES, "AES-GCM", true, ["encrypt", "decrypt"])  // TODO: try catch - if the URL is not valid

      let decryptedNote = await window.crypto.subtle.decrypt({ name: "AES-GCM", iv: decodedIV }, decodedAES, encryptedNote);  // TODO: try catch - if the URL is not valid

      const decoder = new TextDecoder("utf-8");
      secretNote = decoder.decode(decryptedNote);
    }

    setNote(secretNote)
    setShow(true)
  };

  const copySecretToClipboard = () => {
    navigator.clipboard.writeText(note)
  };

  const deleteNote = async () => {
    const deleteData = async () => {
      let resp = null
      try {
        resp = await axios.delete(`/api/note/${iv}`)
        if (resp.data.result !== "OK") {
          setAlert("Sorry, the secret note was not deleted.")
        } else { setDeleted(true) }
      }
      catch (error) {
        if (error.request.status !== 200) {
          setAlert("Sorry, the secret note was not deleted.")
        }
      }
      
    };
    await deleteData()
    
  };

  return (
    <>
      <div className="row py-5 mt-a-lot justify-content-center">
        <div className="col-12">
          <div className="card shadow" style={{maxWidth: "45rem", margin: "0 auto"}}>

          {showNote === false &&
            <>
              <div className="card-header">
                <img src="./img/teskalabs-logo.svg" style={{maxWidth: "50px", objectFit: "contain"}}></img>
              </div>
              <div className="card-body">
                <button className="btn btn-primary btn-lg" type="button" onClick={revealSecret}>Reveal the secret</button>
              </div>
            </>
          }

          {note === null && showNote === true &&
            <>
              <div className="card-header">
                <h2>Secret note was not found :(</h2>
              </div>
              <div className="card-body">
                <h5 className="card-title">Sorry, I cannot reveal the secret.</h5>
              </div>
            </>
          }

          {note != null && showNote === true &&
            <>
              <div className="card-header">
              <img src="./img/teskalabs-logo.svg" style={{maxWidth: "50px", objectFit: "contain"}}></img>
              </div>
              <div className="card-body">
                <div className="py-2">
                  <pre>
                    <textarea id="text-area" disabled className="form-control card-text font-monospace" value={note} rows="4"></textarea>
                  </pre>
                </div>
                <div className="d-grid gap-2 col-lg-6 mx-auto">
                  <button className="btn btn-primary btn-lg" onClick={copySecretToClipboard}>Copy secret to clipboard</button>
                  { deleted === false && <button className="btn btn-danger btn-lg" onClick={deleteNote}>Delete Note</button> }
                  { deleted === true && <button className="btn btn-dark btn-lg" disabled onClick={deleteNote}>Note was deleted!</button> }
                </div>
              </div>
            </>
          }
          </div>

        </div>
      </div>
    </>
  );
}

function BagmanRouter({setAlert}) {
  return(
    <Routes>
      <Route index element={< SaveNoteScreen setAlert={setAlert}/>} />
      <Route path="/:iv/:aes" element={<DisplayNoteScreen setAlert={setAlert}/>} />
      <Route path="/unicorns" element={<UnicornsScreen />} />
    </Routes>
  )
}


function App() {
  const [alert, setAlert] = useState(null)

  return (
    <>
      {alert !== null &&
      <div className="alerts">
        <div className="alert alert-primary alert-dismissible" role="alert">
          {alert}
          <button type="button" className="btn-close" onClick={() => {setAlert(null);}}></button>
        </div>
      </div>
      }
      <Navbar />
      <div className="container text-center">
          <BagmanRouter setAlert={setAlert}/>
      </div>
    </>

  );
}

export default App;

