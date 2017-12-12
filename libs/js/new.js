const connectionManager = new ConnectionManager();

$("send").addEventListener("click", function(){
	var name = $("name").value;
	var playersSelect = $("players");
	var players = playersSelect.options[playersSelect.selectedIndex].value;

	connectionManager.newSession(name, players);
});
