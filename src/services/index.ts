import * as GameService from './game'
import * as PlayerService from './player'
import { config } from '../../config'
import { Logger } from '../util/logger'
var MongoClient = require('mongodb').MongoClient

const setUpdatesCallback = (onGameUpdate, onPlayerUpdate) => {
	MongoClient.connect(
		'mongodb://' +
			config.mongodb.host +
			':' +
			config.mongodb.port +
			'/' +
			config.mongodb.db +
			'?replicaSet=' +
			config.mongodb.replicaSetName,
		{ useNewUrlParser: true },
		function (err, database) {
			if (err) throw err
			var db = database.db('cards-io')
			const playersChangeStream = db
				.collection('players')
				.watch({ fullDocument: 'updateLookup' })
			playersChangeStream.on('change', async (change) => {
				var player = change.fullDocument
				player = {
					id: player._id,
					name: player.name,
					hand: player.hand,
					position: player.position,
					score: player.score
				}
				let code
				try {
					code = (await GameService.getById(player.game)).code
				} catch (err) {
					code = 'null'
				}
				onPlayerUpdate(player, code)
			})
			const gamesChangeStream = db
				.collection('games')
				.watch({ fullDocument: 'updateLookup' })
			gamesChangeStream.on('change', async (change) => {
				console.log(change)
				if (change.operationType !== 'delete') {
					var game = change.fullDocument
					game = await GameService.pluckById(game._id)
					onGameUpdate(game)
				}
			})
		}
	)
}

export { GameService, PlayerService, setUpdatesCallback }
