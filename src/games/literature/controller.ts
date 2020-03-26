import { Deck, Player, Game } from '../../engine'
import { GameService, PlayerService } from '../../services'

var testLit = async () => {
	var deck = new Deck()

	var p1 = await Player.build('five')
	var p2 = await Player.build('six')
	console.log(p2)

	var game = await Game.build('Literature', deck, 8, true, p1)
	await GameService.addPlayerToGame(game.id, p2.id)

	let c = await GameService.getGameByCode(game.code)
	console.log(c)
}

var hostGame = async(gameType: string, ownerName: string) => {
	const deck = new Deck()
	const maxPlayers = 8
	const isTeamGame = true

	let p = await Player.build(ownerName)
	let g = await Game.build(gameType, deck, maxPlayers, isTeamGame, p)
	return g
}

var joinGame = async(game: Game, playerName: string) => {
	let p = await Player.build(playerName)
	game.addPlayer(p)
	return p.position
}

var startGame = async(game: Game) => {
	game.prepareGame()
}

var askForCard = async(from: Player, to: Player, card: string) => {
	try {
		from.add(to.discard(card))
		console.log(from.name + ' took ' + card + ' from ' + to.name)
	} catch (err) {
		console.log(from.name + ' asked ' + to.name + ' for ' + card)
	}
}

var transferTurn = async(game: Game, to: Player) => {
	game.currentTurn = to.position
	console.log('Turn transferred to ' + to.name)
}

var declareSet = async(game: Game, player: Player, declaration: string[][]) => {
	let isPlayerEvenTeam = Number(player.position % 2 === 0)
	let successfull = true
	for(let i = 0; i < declaration.length; i++) {
		let currentPos = 2*i + isPlayerEvenTeam
		for (let j = 0; j < declaration[i].length; j++){
			let currentCard	= declaration[i][j]
			let cardHolder = game.findCardWithPlayer(currentCard)
			if (cardHolder !== currentPos) {
				successfull = false
			}
			game.players[cardHolder].discard(currentCard)
		}
	}
	if (successfull) {
		player.score += 1
		console.log(player.name + ' correctly declared the ' + '')
	} else {
		game.players[(player.position+1)%game.players.length].score += 1
		console.log(player.name + ' incorrectly declared the ' + '')
	}
}
export { testLit }
