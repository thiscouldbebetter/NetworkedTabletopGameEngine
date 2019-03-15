
function World(name, ticksPerSecond, size, actions, bodyDefns, bodiesInitial)
{
	this.name = name;
	this.ticksPerSecond = ticksPerSecond;
	this.size = size;
	this.actions = actions.addLookups("name").addLookups("inputName");
	this.bodyDefns = bodyDefns.addLookups("name");

	this.bodies = [];

	this.bodiesToSpawn = bodiesInitial.slice();
	this.bodyIDsToRemove = [];

	this.updatesImmediate = [];
	this.updatesOutgoing = [];
}
{
	// static methods

	World.build = function(arenaSize, movableDimension, playerSize, numberOfPlayers)
	{
		var actions = 
		[
			new Action
			(
				"Activate",
				"MouseDown", // "Enter", // inputName
				// peform
				function(universe, world, body)
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
				function(universe, world, body)
				{
					body.pos.y += 1;
				}
			),

			new Action
			(
				"MoveLeft",
				"ArrowLeft", // inputName
				// perform
				function(universe, world, body)
				{
					body.pos.x -= 1;
				}
			),

			new Action
			(
				"MoveRight",
				"ArrowRight", // inputName
				// perform
				function(universe, world, body)
				{
					body.pos.x += 1;
				}
			),

			new Action
			(
				"MoveToMouseCursor",
				"MouseMove", // inputName
				// perform
				function(universe, world, body)
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
				function(universe, world, body)
				{
					body.pos.y -= 1;
				}
			),
						
			new Action
			(
				"Quit",
				"Escape", // inputName
				function(universe, world, body)
				{
					// todo
				}
			),
		];

		var actionNames = actions.members("name");

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
	
	World.default = function()
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

	World.prototype.bodyRemove = function(body)
	{
		if (body != null)
		{
			this.bodies.remove(body);
			this.bodies[body.id] = null;
			delete this.bodies[body.id];
		}
	};

	World.prototype.bodySpawn = function(body, spawnUnder)
	{
		if (spawnUnder)
		{
			this.bodies.splice(0, 0, body);
		}
		else
		{
			this.bodies.push(body);
		}
		this.bodies[body.id] = body;
		body.initializeForWorld(this);
	};

	World.prototype.millisecondsPerTick = function()
	{
		return Math.floor(1000 / this.ticksPerSecond);
	};

	World.prototype.movablesAtPosAddToList = function(posToCheck, movablesAtPos)
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
	
	World.prototype.overwriteWith = function(other)
	{
		this.name = other.name;
		this.ticksPerSecond = other.ticksPerSecond;
		this.size = other.size;
		this.actions = other.actions;
		this.bodyDefns = other.bodyDefns;
		this.bodies = other.bodies;
	};
		
	World.prototype.updateForTick_Remove = function()
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

	World.prototype.updateForTick_Spawn = function()
	{
		for (var i = 0; i < this.bodiesToSpawn.length; i++)
		{
			var body = this.bodiesToSpawn[i];
			this.bodySpawn(body);
		}
		this.bodiesToSpawn.length = 0;
	};
	
	World.prototype.updateForTick_UpdatesApply = function(updatesToApply)
	{
		for (var i = 0; i < updatesToApply.length; i++)
		{
			var update = updatesToApply[i];
			update.updateWorld(this);
		}
		updatesToApply.length = 0;
	};

	// drawable

	World.prototype.drawToDisplay = function(display)
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
