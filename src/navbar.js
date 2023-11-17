import '@popperjs/core';


function Navbar() {
	return (
		<>
		<div className="container">
			<nav className="navbar navbar-expand-lg bg-body-lightpink">
			<div className="container-fluid">
				<div class="collapse navbar-collapse" id="navbarText">
					<ul class="navbar-nav me-auto mb-2 mb-lg-0">
						<li class="nav-item">
						<a className="navbar-brand fs-3 text-secondary" href="#">
							<i class="bi bi-house text-secondary fs-3"></i>
						</a>
						</li>
						<li class="nav-item">
						<a className="navbar-brand fs-3 text-secondary" href="#/unicorns">
								<i class="bi bi-question-lg text-secondary fs-3"></i>
						</a>
						</li>
						<li class="nav-item">
						<a className="navbar-brand fs-3 text-secondary" href="https://github.com/eliska-n/BagManUI">
								<i class="bi bi-github text-secondary fs-3"></i>
						</a>
						</li>

					</ul>
				</div>
			</div>
			</nav>
		</div>

		</>
	)
}

export { Navbar };
