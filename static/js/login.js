function submitLogin(e) {
	e.preventDefault();
	grecaptcha.ready(function() {
		grecaptcha.execute("6LdHimkqAAAAAOXLRndbYvcmN3dzYjvLz7-5QBAD", {action: "submit"}).then((token) => {
			// Add your logic to submit to your backend server here.
			let data = {"token": token};
			fetch('/captcha', {
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				method: "post",
				body: JSON.stringify(data)
			}).then(response => response.json()).then((json) => {
				if (json.google_response.score > 0.5) {
					console.log("Human")
					const username = document.querySelector("#username").value;
					const password = document.querySelector("#password").value;
					const credentials = {"username": username, "password": password};
					fetch("/auth", {
						headers: {
							"Accept": "application/json",
							"Content-Type": "application/json"
						},
						method: "post",
						body: JSON.stringify(credentials)
					});
				}
			}).catch(error => console.log(error));
		});
	});
}