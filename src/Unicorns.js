function UnicornsScreen() {
  return (
    <div>
      <h1>unicorns to be here</h1>
    </div>
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