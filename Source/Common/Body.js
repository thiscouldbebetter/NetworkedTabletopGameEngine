
class Body
{
	constructor(id, name, defnName, pos)
	{
		this.id = id;
		this.name = name;
		this.defnName = defnName;
		this.pos = pos;

		this.bodyHeld = null;
	}

	// instance methods

	defn(world)
	{
		var returnValue = world.bodyDefnByName(this.defnName);
		return returnValue;
	}

	initializeForWorld(world)
	{
		var bodyDefn = this.defn(world);
		this.activity = bodyDefn.activity;
	}

	movable(world)
	{
		return this.defn(world).movable();
	}

	overwriteWith(other)
	{
		this.defnName = other.defnName;
		this.pos.overwriteWith(other.pos);
	}

	updateForTick_Actions(universe, world)
	{
		if (this.activity != null)
		{
			var bodyDefn = this.defn(world);

			var inputHelper = universe.inputHelper;

			this.activity.perform(world, inputHelper, this, this.activity);

			var actionNames = this.activity.actionNames;

			for (var a = 0; a < actionNames.length; a++)
			{
				var actionName = actionNames[a];
				var action = world.actionByName(actionName);
				action.perform(universe, world, this);
			}
			
			actionNames.length = 0;
		}
	};

	updateForTick_Connectivity()
	{
		if (this.isDisconnected)
		{
			if (this.defn(world).categoryNames.contains("Player") == true)
			{
				Log.write(this.name + " was destroyed.")
			}
			var update = new Update_BodyRemove
			(
				this.id
			);
			world.updatesImmediate.push(update);
			world.updatesOutgoing.push(update);
		}
	};

	// drawable

	drawToDisplay(display, world)
	{
		var body = this;

		var bodyPos = body.pos;

		var bodyHeld = body.bodyHeld;
		if (bodyHeld != null)
		{
			bodyHeld.pos.overwriteWith(bodyPos);
			bodyHeld.drawToDisplay(display, world);
		}

		var bodyDefn = body.defn(world);
		var bodyVisual = bodyDefn.visual;

		bodyVisual.draw(display, bodyPos);
	}
}
