import { useState } from 'react';

function UnicornsScreen() {
  const [page, setPage] = useState(1)
  return (
    <>
    <div className="row py-4 justify-content-center">
      <div className="col-12">
        <div className="card shadow">

          <div className="card-header">
            <h1>How does it work?</h1>
          </div>

          <div className="card-body">

            <div className="row justify-content-center">
              <div className="col-12">
                <img src={`./img/uni_${page.toString()}.png`} style={{maxWidth: "100%", maxHeight: "100%", objectFit: "contain"}}></img>
                <button className="carousel-control-prev" type="button" onClick={() => {if (page>1) {setPage(page - 1)};}}>
                  <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                  <span className="visually-hidden">Previous</span>
                </button>
                <button className="carousel-control-next" type="button" onClick={() => {if (page<5) {setPage(page + 1)};}}>
                  <span className="carousel-control-next-icon" aria-hidden="true"></span>
                  <span className="visually-hidden">Next</span>
                </button>
              </div>
            </div>

            <div className="row justify-content-center">
              <div className="col-12 col-lg-10">
                <p className="card-text">There will be text about the unicrons.</p>
              </div>
            </div>

            <div className="row justify-content-center">
              <div className="col-12 col-lg-10">
                <input id="page" type="range" className="form-range" value={page} onChange={(event) => {setPage(event.target.value);}} min="1" max="5" step="1"></input>
              </div>
            </div>

          </div>
        </div>
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
      <div className="card-body" style={{backgroundColor: "rgba(165, 16, 128, 0.75)"}}>
        <a className="link-light icon-link icon-link-hover" href="#/unicorns">
        Is it safe? Tell me how it works!
        </a>
      </div>
      </div>
    </div>
    </div>
  )
}

export {UnicornsScreen};
export {LinkToUnicorns};