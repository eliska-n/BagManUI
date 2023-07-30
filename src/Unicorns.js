import { useState } from 'react';

function UnicornsScreen() {
  const [page, setPage] = useState(1)


  const pageOneText = `Meet Alice and Bob. Alice needs to tell a secret password to Bob.
  Alice and Bob are split by the dangerous ocean of the internet, full of pirates always ready to steal unprotected secrets.
  She always encrypts the secret before sending it to Bob. And that's what this application does for you.`

  const pageTwoText = `First, Alice creates an AES key.
  With this key she can encyŕypt the secret - lock it into a secure box.
  She creates also an ID - a unique identificator for the secret pictured here as the pink circle.
  Alice also decides how long the secret should be available to Bob.
  The shorter the period, the safer.
  She sets the expiration to 15 minutes.`

  const pageThreeText = `Alice must never send the key and the box together.
  There is an island in the ocean (a server) with Frank.
  Frank's job is to receive boxes, read expiration and attach dynamit and timer to it, so the boxes blow up when the time comes.
  Then, Frank stores these boxes. He can never read the secrets inside.
  Even if the pirates stole all the boxes, they could not open them without the keys.
  `

  const pageFourText = `Now, Alice must send a key and ID of the box to Bob.
  Secrets should have as short expiration as possible.
  If a pirate reads this message with the key and ID inside (the link from this application), he would need to find Frank's island (the server) before the secret explodes.
  When Bob reads the message, he has everything to get the secret from Frank.
  `

  const PageFiveText = `Bob uses the ID (pink circle) to ask Frank for the box with the secret.
  If the box didn't blow up, yet, Bob receives it and he can use the key to open it.
  This happens safely in Bob's browser without any pirate watching.
  Alice and Bob manged to keep their secret safe from pirates.
  Use this application to protect your secrets as well as unicorns do.
  `


  const textTable = {
    1: pageOneText,
    2: pageTwoText,
    3: pageThreeText,
    4: pageFourText,
    5: PageFiveText
  }

  return (
    <>
      <div className="row py-4 justify-content-center">
        <div className="col-12 col-lg-10">
          <div className="card shadow">

            <div className="card-header">
              <h1>How does it work?</h1>
            </div>

            <div className="card-body">

              <div className="row py-1 justify-content-center">
                <div className="col-12">
                  <img src={`./img/uni_${page.toString()}.png`} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}></img>
                  <button className="carousel-control-prev" type="button" onClick={() => { if (page > 1) { setPage(page - 1) }; }}>
                    <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span className="visually-hidden">Previous</span>
                  </button>
                  <button className="carousel-control-next" type="button" onClick={() => { if (page < 5) { setPage(page + 1) }; }}>
                    <span className="carousel-control-next-icon" aria-hidden="true"></span>
                    <span className="visually-hidden">Next</span>
                  </button>
                </div>
              </div>

              <div className="row py-1 justify-content-center">
                <div className="col-12">
                  <p className="card-text">{textTable[page]}</p>
                </div>
              </div>

              <div className="row justify-content-center">
                <div className="col-12 col-lg-10">
                  <input id="page" type="range" className="form-range" value={page} onChange={(event) => { setPage(event.target.value); }} min="1" max="5" step="1"></input>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <div className="row justify-content-center">
        <div className="col-12 col-lg-6">
          <ul class="nav nav-pills justify-content-center">
            <li class="nav-item">
              <a class="nav-link active" aria-current="page" href="/">Back to the app</a>
            </li>
          </ul>
        </div>
      </div>
    </>
  )
}


function LinkToUnicorns() {
  return (
    <div className="row py-4 justify-content-center">
      <div className="col-12 col-lg-6">
        <div className="card shadow">
          <div className="card-body" style={{ backgroundColor: "rgba(165, 16, 128, 0.75)" }}>
            <a className="link-light icon-link icon-link-hover" href="#/unicorns">
              Is it safe? Tell me how it works!
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export { UnicornsScreen };
export { LinkToUnicorns };