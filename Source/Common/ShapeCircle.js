
function ShapeCircle(radius)
{
	this.radius = radius;
}
{
	ShapeCircle.prototype.containsPoint = function(pointToCheck, shapePos)
	{
		var distance = pointToCheck.clone().subtract(shapePos).magnitude();
		var returnValue = (distance <= this.radius);
		return returnValue;
	}

	ShapeCircle.prototype.draw = function(display, pos, color)
	{
		display.drawCircle(pos, this.radius, color);
	}
}