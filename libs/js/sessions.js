const connectionManager = new ConnectionManager();

if(localStorage.getItem("error")) {
	$("message").classList.remove("invisible");
	$("message").innerHTML = localStorage.getItem("error");
	localStorage.removeItem("error");
}

setInterval(function (connectionManager) {
	connectionManager.getSessions();
}, 500, connectionManager);
