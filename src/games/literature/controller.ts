import { Deck, Player, Game } from '../../engine'
import { GameService, PlayerService } from '../../services'

var testLit = async () => {
	let po = await Player.build('Nandha', 2)
	let hostedGame = await hostGame(po)
	var p1 = await Player.build('Naven', 3)
	await hostedGame.addPlayer(p1)
	var p2 = await Player.build('Vivek', 1)
	await hostedGame.addPlayer(p2)

	hostedGame.prepareGame()
}

var handleReconnect = async (id: string) => {
	let p = await PlayerService.pluckById(id)
	let g = await GameService.pluckById(p.game)
	return { player: p, game: g }
}

var registerPlayer = async (id: string, name: string, pos: number) => {
	try {
		var player = await PlayerService.getObjectById(id)
		player.updateDetails(name, pos)
	} catch (err) {
		player = await Player.build(name, pos)
	}
	return player
}

var hostGame = async (owner: Player) => {
	const gameType = 'literature'
	const deck = new Deck()
	const minPlayers = 6
	const maxPlayers = 8
	const isTeamGame = true

	let g = await Game.build(
		gameType,
		deck,
		minPlayers,
		maxPlayers,
		isTeamGame,
		owner
	)
	g.decideStarter = function () {
		this._currentTurn = 1
	}
	g.isGameOver = function () {
		for (let i = 0; i < this._players.length; i++) {
			if (this._players[i].hand.length > 0) return false
		}
		return true
	}
	g.processRound = function () {
		if (this._isGameOver()) this.end()
		else {
			let isEvenDone = true,
				isOddDone = true
			for (let i = 0; i < this._players.length; i++) {
				let current = this._players[i]
				if (current.position % 2 == 0) {
					isEvenDone = isEvenDone && current.hand.length === 0
				} else {
					isOddDone = isOddDone && current.hand.length === 0
				}
			}
			if (isEvenDone) this.currentTurn = 1
			else if (isOddDone) this.currentTurn = 2
		}
	}
	g.log('CREATE:' + owner.name)

	var p2 = await Player.build('Naven', 2)
	await joinGame(g, p2)
	var p3 = await Player.build('Vivek', 3)
	await joinGame(g, p3)
	var p4 = await Player.build('Bharath', 4)
	await joinGame(g, p4)
	var p5 = await Player.build('Tejus', 5)
	await joinGame(g, p5)
	var p6 = await Player.build('Shohan', 6)
	await joinGame(g, p)

	return g
}

var joinGame = async (game: Game, player: Player) => {
	await game.addPlayer(player)
	game.log('JOIN:' + player.name)
}

var leaveGame = async (game: Game, player: Player) => {
	let success = await game.removePlayer(player)
	if (success) {
		game.log('LEAVE:' + player.name)
		return true
	} else return false
}

var startGame = (game: Game) => {
	game.prepareGame()
	game.log('START')
}

var askForCard = (game: Game, from: Player, to: Player, card: string) => {
	try {
		from.add(to.discard(card))
		game.log('TAKE:' + from.name + ':' + to.name + ':' + card)
		console.log(from.name + ' took ' + card + ' from ' + to.name)
	} catch (err) {
		game.log('ASK:' + from.name + ':' + to.name + ':' + card)
		console.log(from.name + ' asked ' + to.name + ' for ' + card)
		game.currentTurn = to.position
	}
}

var transferTurn = (game: Game, from: Player, to: Player) => {
	game.currentTurn = to.position
	game.log('TRANSFER:' + from.name + ':' + to.name)
	console.log('Turn transferred to ' + to.name)
}

var declareSet = (
	game: Game,
	player: Player,
	set: string,
	declaration: string[][]
) => {
	game.log('ATTEMPT:' + player.name + ':' + set)
	let playerTeam = player.position % 2
	let successful = true
	for (let i = 0; i < declaration.length; i++) {
		let currentPos = 2 * (i + 1) - playerTeam
		for (let j = 0; j < declaration[i].length; j++) {
			let currentCard = declaration[i][j]
			let cardHolder = game.findCardWithPlayer(currentCard)
			if (cardHolder !== currentPos) {
				successful = false
			}
			game.getPlayerByPosition(cardHolder).discard(currentCard)
		}
	}
	if (successful) {
		player.score += 1
		game.log('DECLARE:' + player.name + ':' + set)
		console.log(player.name + ' correctly declared the ' + set)
	} else {
		let opponent = game.getPlayerByPosition(
			(player.position + 1) % game.players.length
		)
		opponent.score += 1
		game.currentTurn = opponent.position
		game.log('DECLARE:' + opponent.name + ':' + set)
		console.log(player.name + ' incorrectly declared the ' + set)
	}
	game.processRound()
}
export {
	handleReconnect,
	registerPlayer,
	hostGame,
	joinGame,
	leaveGame,
	startGame,
	askForCard,
	transferTurn,
	declareSet
}
