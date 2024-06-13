
class ShapeCircle
{
	constructor(radius)
	{
		this.radius = radius;
	}

	containsPoint(pointToCheck, shapePos)
	{
		var distance = pointToCheck.clone().subtract(shapePos).magnitude();
		var returnValue = (distance <= this.radius);
		return returnValue;
	}

	draw(display, pos, color)
	{
		display.drawCircle(pos, this.radius, color);
	}
}