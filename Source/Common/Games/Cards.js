
class Card
{
	constructor(suit, rank)
	{
		this.suit = suit;
		this.rank = rank;
	}

	name()
	{
		return this.rank.name + " of " + this.suit.name;
	}

	symbol()
	{
		return this.rank.symbol + this.suit.symbol;
	}
}

class CardGroup
{
	constructor(name, cards)
	{
		this.name = name;
		this.cards = cards;
	}

	static deckStandard()
	{
		var cards = [];

		var suits = CardSuit.Instances()._All;
		var ranks = CardRank.Instances()._All;

		for (var s = 0; s < suits.length; s++)
		{
			var suit = suits[s];

			for (var r = 0; r < ranks.length; r++)
			{
				var rank = ranks[r];

				var card = new Card(suit, rank);

				cards.push(card);
			}
		}

		var cardGroup = new CardGroup
		(
			"Deck",
			cards
		);

		return cardGroup;
	}
}

class CardRank
{
	constructor(name, symbol, value)
	{
		this.name = name;
		this.symbol = symbol;
		this.value = value;
	}

	static Instances()
	{
		if (this._instances == null)
		{
			this._instances = new CardRank_Instances();
		}

		return this._instances;
	}
}

class CardRank_Instances
{
	constructor()
	{
		var cr = (n, s, v) => new CardRank(n, s, v);

		this.Two 	= cr("Two", "2", 2);
		this.Three 	= cr("Three", "3", 3);
		this.Four 	= cr("Four", "4", 4);
		this.Five 	= cr("Five", "5", 5);
		this.Six 	= cr("Six", "6", 6);
		this.Seven 	= cr("Seven", "7", 7);
		this.Eight 	= cr("Eight", "8", 8);
		this.Nine 	= cr("Nine", "9", 9);
		this.Ten 	= cr("Ten", "10", 10);
		this.Jack 	= cr("Jack", "J", 11);
		this.Queen 	= cr("Queen", "Q", 12);
		this.King 	= cr("King", "K", 13);
		this.Ace 	= cr("Ace", "A", 14);

		this._All =
		[
			this.Two,
			this.Three,
			this.Four,
			this.Five,
			this.Six,
			this.Seven,
			this.Eight,
			this.Nine,
			this.Ten,
			this.Jack,
			this.Queen,
			this.King,
			this.Ace
		];
	}
}

class CardSuit
{
	constructor(name, symbol, color)
	{
		this.name = name;
		this.symbol = symbol;
		this.color = color;
	}

	static Instances()
	{
		if (this._instances == null)
		{
			this._instances = new CardSuit_Instances();
		}

		return this._instances;
	}
}

class CardSuit_Instances
{
	constructor()
	{
		var cs = (n, s, c) => new CardSuit(n, s, c);

		var colorBlack = "Black";
		var colorRed = "Red";

		this.Clubs 		= cs("Clubs", "C", colorBlack);
		this.Diamonds 	= cs("Diamonds", "D", colorRed);
		this.Hearts 	= cs("Hearts", "H", colorRed);
		this.Spades 	= cs("Spades", "S", colorBlack);

		this._All =
		[
			this.Clubs,
			this.Diamonds,
			this.Hearts,
			this.Spades
		];
	}
}

class WorldBuilderCards
{
	static build
	(
		arenaSize,
		movableDimension,
		playerSize,
		numberOfPlayers
	)
	{
		var actions = this.build_Actions();

		var bodyDefns = [];

		var cards = CardGroup.deckStandard().cards;

		var cardScaleFactor = 10;

		var cardShape = new ShapeRectangle
		(
			new Coords(2, 3)
				.multiplyScalar(cardScaleFactor)
		);

		var cardBackgroundColor = "White";
		var cardBorderColor = "DarkGray";

		var visualCardBlank =
			new VisualShape
			(
				cardShape,
				cardBackgroundColor,
				cardBorderColor
			);

		var textHeightInPixels = cardScaleFactor;

		var cardsAsBodyDefns = cards.map
		(
			card =>
			{
				var cardSuit = card.suit;
				var cardRank = card.rank;

				var cardText = card.symbol();

				var cardTextColor = cardSuit.color;

				var visual = new VisualGroup
				([
					visualCardBlank,
					new VisualText
					(
						cardText,
						textHeightInPixels,
						cardTextColor
					),
				]);

				return new BodyDefn
				(
					card.name(), 
					null, // categoryNames,
					"White", // color, 
					cardShape,
					visual,
					null, // activity,
					null // actionNames
				);
			}
		);

		var worldSize =
			new Coords(1, 1).multiplyScalar(arenaSize);

		var bodyDefns = [];
		bodyDefns.push(...cardsAsBodyDefns);

		var playerName = "Player"; // todo
		var bodyDefnPlayer = BodyDefn.player(playerName, playerSize);
		bodyDefns.push(bodyDefnPlayer);

		var cellSizeInPixels =
			Coords.ones().multiplyScalar(100);

		var bodyOrientationDefault =
			new Coords(1, 0); // todo

		var bodies = cardsAsBodyDefns.map
		(
			x =>
			{
				var posInCells = Coords.random();

				var defnName = x.name;

				return new Body
				(
					defnName,
					defnName,
					defnName,
					posInCells
						.clone()
						.add(Coords.ones() ) 
						.multiply(cellSizeInPixels),
					bodyOrientationDefault
				)
			}
		);
		
		// todo - Add player body.

		var returnValue = new World
		(
			"WorldCards",
			20, // ticksPerSecond,
			"Green", // colorBackground
			worldSize,
			actions,
			bodyDefns,
			bodies
		);

		return returnValue;
	}

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


}