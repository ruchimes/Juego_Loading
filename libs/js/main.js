const connectionManager = new ConnectionManager();
const gameManager = new GameManager(document);
const localPlayer = gameManager.createPlayer();

localPlayer.element.classList.add('border-white');
localPlayer.run();

connectionManager.addGameManager(gameManager);
connectionManager.init();

setInterval(function (gameManager) {
	if(gameManager.playing)
	    gameManager.checkPlaying();
}, 500, gameManager);


$("restart").addEventListener('click', () => {
	connectionManager.restart();
});

const listener = () => {
    localPlayer.stop();
};

document.addEventListener('keydown', listener);
document.addEventListener('click', listener);
document.addEventListener('touchstart', listener);