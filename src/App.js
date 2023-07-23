import './App.css';
import { Link } from "react-router-dom";
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

  const [note, setNote] = useState('');
  const [url, setUrl] = useState(null);

  const saveNote = async () => {

    // Make the textArea read only (TODO)

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
    let keyData = [];
    new Uint8Array(keyExported).forEach((byte) => keyData.push(String.fromCharCode(byte)));
    let keyBase64 = Base64.encodeURI(Base64.btoa(keyData.join("")));  // Use js-base64 library for URL safe encoding

    // Generate iv
    const iv = window.crypto.getRandomValues(new Uint8Array(12));   // TODO: this is gonna be id in BE - is it big/random enough?
    // translate iv to base64
    // It becomes part of the URL
    // It becomes id of the record in BE database
    let ivData = [];
    iv.forEach((byte) => ivData.push(String.fromCharCode(byte)));
    const ivBase64 = Base64.encodeURI(Base64.btoa(ivData.join("")));  // Use js-base64 library for URL safe encoding

    // Encrypt the secret note
    const encoder = new TextEncoder("utf-8");
    const encodedNote = encoder.encode(note);

    let encryptedNote = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      key,
      encodedNote
    );

    // encrypted note to base64
    let noteData = [];
    new Uint8Array(encryptedNote).forEach((byte) => noteData.push(String.fromCharCode(byte)));
    let encryptedNoteBase64 = Base64.encodeURI(Base64.btoa(noteData.join("")));  // Use js-base64 library for URL safe encoding

    // send to BE
    const client = axios.create({
      baseURL: "/api",
    });

    try {
      let resp = await client.post("/save-password", {id: ivBase64, secret: encryptedNoteBase64, ttl: 1200}); // TODO - kolikje ttl? mělo by to být nastavitelné
      console.log(resp.data);
      if (resp.data.result !== "OK") {
        // do something
      }

    } catch (error) {
      console.log("error in BE call")
      console.error(error)
    }

    console.log("setting url")
    // show the URL to share the secret note
    setUrl(window.location.origin + "/#/" + ivBase64 + "/" + keyBase64)

    
  }

  return (

    <>
      <section id="password-entry">
        <h2>Enter a Note</h2>
        <textarea value={note} onChange={(event) => {setNote(event.target.value);}} rows="4" cols="50"></textarea>
        <br></br>
        <button onClick={saveNote}>Save Note</button>
      </section>

      {url != null && <section>
        <h2> Use this URL to share the secret note</h2>
        <p>{url}</p>
      </section>}
    </>


  );
}

function DisplayNoteScreen() {
  const { iv, aes } = useParams();

  const [note, setNote] = useState(null);

  useEffect( () => {

    const getSecretNote = async () => {

      let ignore = false;  // https://react.dev/learn/synchronizing-with-effects#fetching-data
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

      let resp = await fetchData();
      if ( resp !== null ) {
        console.log(resp)
      }

      if (!ignore) {
        setNote(secretNote);
      }

      return () => {
        ignore = true;
      };

    };

    getSecretNote()

  }, []);


  return (
    <>
      {note == null && <section id="display-note">
        <h2> Secret note was not found :( </h2>
      </section>}

      {note != null && <section id="display-note">
        <h2> Here is your super secret note! </h2>
        <p>{note}</p>
      </section>}
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
    <div className="App">
        <BagmanRouter />
    </div>
  );
}

export default App;


// TODOS
// zvolit si na jak dlouho to může být uložený + rozumný default
