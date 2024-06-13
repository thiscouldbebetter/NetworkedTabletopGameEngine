
class World
{
	constructor(name, ticksPerSecond, size, actions, bodyDefns, bodiesInitial)
	{
		this.name = name;
		this.ticksPerSecond = ticksPerSecond;
		this.size = size;
		this.actions = actions;
		this.actionsByName = new Map(actions.map(x => [x.name, x] ) );
		this.actionsByInputName = new Map(actions.map(x => [x.inputName, x] ) );
		this.bodyDefns = bodyDefns;
		this.bodyDefnsByName = new Map(this.bodyDefns.map(x => [x.name, x] ) );

		this.bodies = [];
		this.bodiesById = new Map();

		this.bodiesToSpawn = bodiesInitial.slice();
		this.bodyIDsToRemove = [];

		this.updatesImmediate = [];
		this.updatesOutgoing = [];
	}

	// static methods

	static build(arenaSize, movableDimension, playerSize, numberOfPlayers)
	{
		var actions = 
		[
			new Action
			(
				"Activate",
				"MouseDown", // "Enter", // inputName
				// peform
				(universe, world, body) =>
				{
					universe.inputHelper.inputRemove("MouseDown");

					var player = body;
					var playerPos = player.pos;
					if (player.bodyHeld == null)
					{
						var movablesAtPos =
							world.movablesAtPosAddToList(playerPos, []);
						if (movablesAtPos.length > 0)
						{
							var movableToPickUp = movablesAtPos[0];
							world.bodyRemove(movableToPickUp);
							player.bodyHeld = movableToPickUp;
						}
					}
					else
					{
						var movableToDrop = player.bodyHeld;
						player.bodyHeld = null;
						movableToDrop.pos.overwriteWith(playerPos);
						world.bodySpawn
						(
							movableToDrop,
							true // spawnUnder
						);
					}
				}
			),

			new Action
			(
				"MoveDown",
				"ArrowDown", // inputName
				// perform
				(universe, world, body) =>
				{
					body.pos.y += 1;
				}
			),

			new Action
			(
				"MoveLeft",
				"ArrowLeft", // inputName
				// perform
				(universe, world, body) =>
				{
					body.pos.x -= 1;
				}
			),

			new Action
			(
				"MoveRight",
				"ArrowRight", // inputName
				// perform
				(universe, world, body) =>
				{
					body.pos.x += 1;
				}
			),

			new Action
			(
				"MoveToMouseCursor",
				"MouseMove", // inputName
				// perform
				(universe, world, body) =>
				{
					var mousePos = universe.inputHelper.mousePos;
					body.pos.overwriteWith(mousePos);
				}
			),

			new Action
			(
				"MoveUp",
				"ArrowUp", // inputName
				// perform
				(universe, world, body) =>
				{
					body.pos.y -= 1;
				}
			),

			new Action
			(
				"Quit",
				"Escape", // inputName
				(universe, world, body) =>
				{
					// todo
				}
			),
		];

		var actionNames = actions.map(x => x.name);

		var bodyDefnMovable = BodyDefn.movable(movableDimension);

		var worldSize = new Coords(1, 1).multiplyScalar(arenaSize);
		
		var bodies = [];

		var numberOfMovables = 8;
		var marginSize = bodyDefnMovable.collider.size;
		var orientationDefault = new Coords(1, 0); // todo
		var worldSizeMinusMargins =
			worldSize.clone().subtract(marginSize).subtract(marginSize);
		for (var i = 0; i < numberOfMovables; i++)
		{
			var movablePos =
				new Coords().randomize().multiply
				(
					worldSizeMinusMargins
				).add
				(
					marginSize
				);

			var bodyMovable = new Body
			(
				"Movable" + i, // id
				"_" + i, // name
				bodyDefnMovable.name,
				movablePos, // pos
				orientationDefault
			);

			bodies.push(bodyMovable);
		}

		var playerName = "Player"; // todo
		var bodyDefnPlayer = BodyDefn.player(playerName, playerSize);
		var playerScreenDimension = playerSize * 2;
		var bodyDefnPlayerScreen = BodyDefn.playerScreen
		(
			playerScreenDimension
		);

		var playerScreenSpacingX = worldSize.x / numberOfPlayers;
		for (var i = 0; i < numberOfPlayers; i++)
		{
			var playerScreenPosX = i * playerScreenSpacingX;
			var playerScreenPos =
				new Coords(1, 1).multiplyScalar(playerScreenDimension / 2).addXY(playerScreenPosX, 0);

			var bodyPlayerScreen = new Body
			(
				"PlayerScreen" + i, // id
				"Player_" + i, // name
				bodyDefnPlayerScreen.name,
				playerScreenPos, // pos
				orientationDefault
			);
			bodies.push(bodyPlayerScreen);
		}
		
		var returnValue = new World
		(
			"World0",
			20, // ticksPerSecond
			worldSize,
			actions,
			// bodyDefns
			[
				bodyDefnMovable,
				bodyDefnPlayer,
				bodyDefnPlayerScreen
			],
			bodies
		);

		return returnValue;
	};

	static default()
	{
		return World.build
		(
			512, // arenaSize
			40,	// movableSize
			15, // playerSize
			4 // numberOfPlayers
		);
	};

	// instance methods

	actionByInputName(inputName)
	{
		return this.actionsByInputName.get(inputName);
	}

	actionByName(name)
	{
		return this.actionsByName.get(name);
	}

	bodyById(id)
	{
		return this.bodiesById.get(id);
	}

	bodyDefnByName(name)
	{
		return this.bodyDefnsByName.get(name);
	}

	bodyRemove(body)
	{
		if (body != null)
		{
			var bodyIndex = this.bodies.indexOf(body);
			if (bodyIndex >= 0)
			{
				this.bodies.splice(bodyIndex, 1);
				this.bodiesById.delete(body.id);
			}
		}
	};

	bodySpawn(body, spawnUnder)
	{
		if (spawnUnder)
		{
			this.bodies.splice(0, 0, body);
		}
		else
		{
			this.bodies.push(body);
		}
		this.bodiesById.set(body.id, body);
		body.initializeForWorld(this);
	};

	millisecondsPerTick()
	{
		return Math.floor(1000 / this.ticksPerSecond);
	};

	movablesAtPosAddToList(posToCheck, movablesAtPos)
	{
		var bodies = this.bodies;
		for (var i = bodies.length - 1; i >= 0; i--)
		{
			var body = bodies[i];
			if (body.defnName == "Movable")
			{
				var movableCollider = body.defn(this).collider;
				if (movableCollider.containsPointForPos(posToCheck, body.pos))
				{
					movablesAtPos.push(body);
				}
			}
		}

		return movablesAtPos;
	}

	overwriteWith(other)
	{
		this.name = other.name;
		this.ticksPerSecond = other.ticksPerSecond;
		this.size = other.size;
		this.actions = other.actions;
		this.bodyDefns = other.bodyDefns;
		this.bodies = other.bodies;
	};

	updateForTick_Remove()
	{
		// hack
		// If a client is paused, the updates build up,
		// and once processing resumes, the body may not be created
		// by the time this attempts to remove it,
		// so it can't remove it, but the list is cleared anyway,
		// so it forgets it needs to remove it,
		// so once it actually gets created it lasts forever. 
		var bodyIDsThatCannotYetBeRemoved = [];
		
		for(var i = 0; i < this.bodyIDsToRemove.length; i++)
		{
			var bodyID = this.bodyIDsToRemove[i];
			var body = this.bodies[bodyID];
			if (body == null)
			{
				bodyIDsThatCannotYetBeRemoved.push(bodyID);
			}
			else
			{
				this.bodyRemove(body);
			}
		}
		this.bodyIDsToRemove = bodyIDsThatCannotYetBeRemoved;
	};

	updateForTick_Spawn()
	{
		for (var i = 0; i < this.bodiesToSpawn.length; i++)
		{
			var body = this.bodiesToSpawn[i];
			this.bodySpawn(body);
		}
		this.bodiesToSpawn.length = 0;
	};

	updateForTick_UpdatesApply(updatesToApply)
	{
		for (var i = 0; i < updatesToApply.length; i++)
		{
			var update = updatesToApply[i];
			update.updateWorld(this);
		}
		updatesToApply.length = 0;
	};

	// drawable

	drawToDisplay(display)
	{
		display.clear();

		var bodies = this.bodies;
		for (var i = 0; i < bodies.length; i++)
		{
			var body = bodies[i];
			body.drawToDisplay(display, this);
		}
	};
}
