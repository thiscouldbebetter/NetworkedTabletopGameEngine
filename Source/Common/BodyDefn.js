
function BodyDefn
(
	name, 
	categoryNames,
	color, 
	collider,
	visual,
	activity,
	actionNames
)
{
	this.name = name;
	this.categoryNames = categoryNames;
	this.color = color;
	this.collider = collider;
	this.visual = visual;
	this.activity = activity;
	this.actionNames = actionNames;
}

{
	BodyDefn.movable = function(dimension)
	{
		var color = ColorHelper.random();

		var shape = new ShapeRectangle(new Coords(1, 1).multiplyScalar(dimension));
		var collider = shape;
		var visualColor = color;
		var visual = new VisualGroup
		([
			new VisualShape(shape, visualColor),
			new VisualText("Movable", visualColor)
		]);
		
		var returnValue = new BodyDefn
		(
			"Movable",
			[ "Movable" ], // categoryNames
			color,
			collider,
			visual,
			null, // activity 
			[] // actionNames
		);

		return returnValue;
	};

	BodyDefn.player = function(name, dimension)
	{
		var color = ColorHelper.random();

		var activityUserInputAccept = new Activity
		(
			"UserInputAccept",
			// perform
			function(world, inputHelper, actor, activity)
			{
				if (inputHelper == null)
				{
					return;
				}
				
				var activityActionNames = activity.actionNames;
				activityActionNames.length = 0;
		
				var bodyDefn = actor.defn(world);

				var inputNamesActive = inputHelper.inputNamesActive;
				for (var i = 0; i < inputNamesActive.length; i++)
				{
					var inputNameActive = inputNamesActive[i];
					var action = world.actions[inputNameActive];
					if (action != null)
					{
						var actionName = action.name;
						if (bodyDefn.actionNames.contains(actionName))
						{
							activityActionNames.push(actionName);
						}
					}
				}

				if (activityActionNames.length > 0)
				{
					var update = new Update_Actions
					(
						actor.id,
						activityActionNames
					);

					world.updatesOutgoing.push(update);
				}
			}
		);

		var shape = new ShapeCircle(dimension);
		var collider = shape;
		var visualColor = color;
		var visual = new VisualGroup
		([
			new VisualShape(shape, visualColor),
			new VisualText("Player", visualColor)
		]);

		var returnValue = new BodyDefn
		(
			name,
			[ "Player" ], // categoryNames
			color,
			collider,
			visual,
			activityUserInputAccept, // activity
			[ "Activate", "MoveDown", "MoveLeft", "MoveRight", "MoveUp", "MoveToMouseCursor" ], // actionNames
		);

		return returnValue;
	};

	BodyDefn.playerScreen = function(dimension)
	{
		var color = "Gray";

		var shape = new ShapeRectangle(new Coords(1, 1).multiplyScalar(dimension));
		var collider = shape;
		var visualColor = color;
		var visual = new VisualGroup
		([
			new VisualShape(shape, visualColor),
			new VisualText("PlayerScreen", visualColor)
		]);
		
		var returnValue = new BodyDefn
		(
			"PlayerScreen",
			[ "PlayerScreen" ], // categoryNames
			color,
			collider,
			visual,
			null, // activity 
			[] // actionNames
		);

		return returnValue;
	};
	
	// instance methods
	
	BodyDefn.prototype.clone = function()
	{
		return new BodyDefn
		(
			this.name, 
			this.categoryNames,
			this.color, 
			this.collider.clone(), 
			this.visual.clone(),
			this.activity.clone(),
			this.actionNames
		);
	};
}
