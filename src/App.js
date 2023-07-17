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

function SaveNoteScreen( {props} ) {

  const [note, setNote] = useState('');
  const [url, setUrl] = useState(null);

  const axios = props.axios

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
    const iv = window.crypto.getRandomValues(new Uint8Array(12)); 
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
    try {
      let resp = await axios.post("/save-password", {id: ivBase64, password: encryptedNoteBase64, ttl: 1200}); // TODO - kolikje ttl? mělo by to být nastavitelné
      console.log(resp.data);
      if (resp.data.result !== "OK") {
        // do something
      }

    } catch (error) {
      console.log("error in BE call")
      console.error(error)
    }

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

function DisplayNoteScreen( {props} ) {
  const { iv, aes } = useParams();
	console.log(iv, aes)

  const axios = props.axios

  const [note, setNote] = useState(null);

  useEffect(() => {
		const fetchData = async () => {
      const resp = await axios.get("/get-password", {password: iv})
      let encryptedNoteBase64 = resp.data.data.password
      console.log(encryptedNoteBase64)
			// setNote(resp)
		}
		fetchData();
	}, []);


  return (

      <section id="display-note">
        <h2>Here is your super secret note!</h2>
        <p> {iv} </p>

      </section>

  );
}

function BagmanRouter( {props} ) {
  return(
    <Routes>
      <Route index element={< SaveNoteScreen props={props} />} />
      <Route path="/:iv/:aes" element={<DisplayNoteScreen props={props} />} />
    </Routes>
  )
}


function App() {

  const client = axios.create({
    baseURL: "/api",
  });

  const props = {
    "axios": client
  }

  console.log("app")

  return (
    <div className="App">

        <BagmanRouter  props={props} />

    </div>
  );
}

export default App;


// TODOS
// zvolit si na jak dlouho to může být uložený + rozumný default
