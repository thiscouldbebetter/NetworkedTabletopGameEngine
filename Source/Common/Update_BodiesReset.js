
class Update_BodiesReset
{
	constructor(bodies)
	{
		this.bodies = bodies;
	}

	updateWorld(world)
	{
		var bodyIdsAll = world.bodies.map(x => x.id);
		world.bodyIDsToRemove.push(...bodiesAllIds);
	}
}
