
function Body(id, name, defnName, pos)
{
	this.id = id;
	this.name = name;
	this.defnName = defnName;
	this.pos = pos;

	this.bodyHeld = null;
}

{
	// instance methods

	Body.prototype.defn = function(world)
	{
		var returnValue = world.bodyDefns[this.defnName];
		return returnValue;
	};

	Body.prototype.initializeForWorld = function(world)
	{
		var bodyDefn = this.defn(world);
		this.activity = bodyDefn.activity;
	};

	Body.prototype.overwriteWith = function(other)
	{
		this.defnName = other.defnName;
		this.pos.overwriteWith(other.pos);
	};

	Body.prototype.updateForTick_Actions = function(universe, world)
	{
		if (this.activity != null)
		{
			var bodyDefn = this.defn(world);

			this.activity.perform(world, null, this, this.activity);

			var actionNames = this.activity.actionNames;

			for (var a = 0; a < actionNames.length; a++)
			{
				var actionName = actionNames[a];
				var action = world.actions[actionName];
				action.perform(universe, world, this);
			}
			
			actionNames.length = 0;
		}
	};

	Body.prototype.updateForTick_Connectivity = function()
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

	Body.prototype.drawToDisplay = function(display, world)
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
