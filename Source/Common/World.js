
class World
{
	constructor
	(
		name,
		ticksPerSecond,
		colorBackground,
		size,
		actions,
		bodyDefns,
		bodiesInitial
	)
	{
		this.name = name;
		this.ticksPerSecond = ticksPerSecond;
		this.colorBackground = colorBackground;
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

	static build
	(
		arenaSize, movableDimension, playerSize, numberOfPlayers
	)
	{
		var actions = this.build_Actions();

		var colors = this.build_Colors();

		var pieceNamesShapesAndCounts =
			this.build_PieceNamesShapesAndCounts();

		var bodyDefns =
			this.build_BodyDefns(colors, pieceNamesShapesAndCounts);

		var worldSize =
			new Coords(1, 1).multiplyScalar(arenaSize);

		var bodies = this.build_Bodies
		(
			bodyDefns, colors, pieceNamesShapesAndCounts, worldSize
		);

		var playerName = "Player"; // todo
		var bodyDefnPlayer = BodyDefn.player(playerName, playerSize);
		bodyDefns.push(bodyDefnPlayer);

		var returnValue = new World
		(
			"World0",
			20, // ticksPerSecond,
			"Green", // colorBackground
			worldSize,
			actions,
			bodyDefns,
			bodies
		);

		return returnValue;
	};

	static build_Actions()
	{
		var actions = 
		[
			new Action
			(
				"Activate",
				"MouseDown", // "Enter", // inputName
				// perform
				this.actionActivatePerform
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

		return actions;
	}

	static build_Bodies
	(
		bodyDefns, colors, pieceNamesShapesAndCounts, worldSize
	)
	{
		var bodies = [];

		var bodyOrientationDefault = new Coords(1, 0); // todo

		var bodyBoardPos = Coords.zeroes(); // todo

		var bodyDefnBoard = bodyDefns.find(x => x.name == "Board");

		var bodyBoard = new Body
		(
			bodyDefnBoard.name, // id
			"_Board", // name
			bodyDefnBoard.name, // defn
			bodyBoardPos, // pos
			bodyOrientationDefault
		);

		bodies.push(bodyBoard);

		for (var c = 0; c < colors.length; c++)
		{
			var color = colors[c];

			for (var p = 0; p < pieceNamesShapesAndCounts.length; p++)
			{
				var pieceNameShapeAndCount = pieceNamesShapesAndCounts[p];
				var pieceName = pieceNameShapeAndCount[0];
				var pieceShape = pieceNameShapeAndCount[1];
				var pieceCount = pieceNameShapeAndCount[2];

				for (var pc = 0; pc < pieceCount; pc++)
				{
					var bodyDefn = bodyDefns.find(x => x.name == color + " " + pieceName);
					var bd = bodyDefns.indexOf(bodyDefn);
					var marginSize = bodyDefn.collider.size;
					var worldSizeMinusMargins =
						worldSize
							.clone()
							.subtract(marginSize)
							.subtract(marginSize);

					var bodyPos =
						Coords.create().randomize().multiply
						(
							worldSizeMinusMargins
						).add
						(
							marginSize
						);

					var body = new Body
					(
						bodyDefn.name, // id
						"_" + bd, // name
						bodyDefn.name,
						bodyPos, // pos
						bodyOrientationDefault
					);

					bodies.push(body);

				}
			}
		}

		return bodies;
	}

	static build_BodyDefnBoard()
	{
		var boardSquareDimension = 100;
		var boardSquareSize = 
			Coords.fromXY(1, 1).multiplyScalar(boardSquareDimension);
		var boardSquareSizeHalf = boardSquareSize.half();
		var boardSquareShape =
			ShapeRectangle.fromSize(boardSquareSize);
		var boardSquareVisualWhite =
			new VisualShape(boardSquareShape, "LightGray");
		var boardSquareVisualBlack =
			new VisualShape(boardSquareShape, "DarkGray");
		var boardSquareVisualsWhiteAndBlack =
		[
			boardSquareVisualWhite,
			boardSquareVisualBlack
		];

		var boardSquaresAsVisuals = [];

		var boardSizeInSquares = Coords.fromXY(8, 8);
		var boardSquarePosInSquares = Coords.create();
		var boardSquarePosInPixels = Coords.create();

		for (var y = 0; y < boardSizeInSquares.y; y++)
		{
			boardSquarePosInSquares.y = y;

			for (var x = 0; x < boardSizeInSquares.x; x++)
			{
				boardSquarePosInSquares.x = x;

				boardSquarePosInPixels
					.overwriteWith(boardSquarePosInSquares)
					.multiply(boardSquareSize)
					.add(boardSquareSizeHalf);

				var squareIndex = y * boardSizeInSquares.x + x + (y % 2);
				var boardSquareVisualWhiteOrBlack =
					boardSquareVisualsWhiteAndBlack[squareIndex % 2]; // todo

				var visualForSquare = new VisualOffset
				(
					boardSquarePosInPixels.clone(),
					boardSquareVisualWhiteOrBlack
				);

				boardSquaresAsVisuals.push(visualForSquare);
			}
		}

		var boardVisual = new VisualGroup(boardSquaresAsVisuals);

		var bodyDefnBoard = new BodyDefn
		(
			"Board", // name, 
			null, // categoryNames,
			"Cyan", // color, 
			null, // collider,
			boardVisual,
			null, // activity,
			null // actionNames
		);

		return bodyDefnBoard;
	}

	static build_BodyDefns(colors, pieceNamesShapesAndCounts)
	{
		var bodyDefns = [];

		for (var c = 0; c < colors.length; c++)
		{
			var color = colors[c];
			var colorOther = colors[1 - c];

			for (var p = 0; p < pieceNamesShapesAndCounts.length; p++)
			{
				var pieceNameShapeAndCount = pieceNamesShapesAndCounts[p];
				var pieceName = pieceNameShapeAndCount[0];
				var pieceShape = pieceNameShapeAndCount[1];

				var bodyDefn = BodyDefn.movable
				(
					color + " " + pieceName, // name
					color,
					colorOther,
					pieceShape
				);

				bodyDefns.push(bodyDefn);
			}
		}

		var bodyDefnBoard = this.build_BodyDefnBoard();
		bodyDefns.push(bodyDefnBoard);

		return bodyDefns;
	}

	static build_Colors()
	{
		var colorWhite = "White";
		var colorBlack = "Black";
		var colors = [ colorWhite, colorBlack ];

		return colors;
	}

	static build_PieceNamesShapesAndCounts()
	{
		var scaleFactor = 20;
		var rectangleMedium =
			ShapeRectangle.fromSize(Coords.fromXY(1, 2).multiplyScalar(scaleFactor) );
		var rectangleShort =
			ShapeRectangle.fromSize(Coords.fromXY(1, 1).multiplyScalar(scaleFactor) );
		var rectangleTall =
			ShapeRectangle.fromSize(Coords.fromXY(1, 3).multiplyScalar(scaleFactor) );

		var pieceNamesShapesAndCounts =
		[
			[ "Bishop", rectangleMedium, 2 ],
			[ "King", rectangleTall, 1 ],
			[ "Knight", rectangleMedium, 2 ],
			[ "Pawn", rectangleShort, 8 ],
			[ "Queen", rectangleTall, 1 ],
			[ "Rook", rectangleMedium, 2 ],
		];

		return pieceNamesShapesAndCounts;
	}

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
			if (body.movable(this) )
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

	// Actions.

	static actionActivatePerform(universe, world, body)
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
				false // spawnUnder
			);
		}
	}

	// drawable

	drawToDisplay(display)
	{
		display.clear();
		display.fillWithColor(this.colorBackground);

		var bodies = this.bodies;
		for (var i = 0; i < bodies.length; i++)
		{
			var body = bodies[i];
			body.drawToDisplay(display, this);
		}
	};
}
