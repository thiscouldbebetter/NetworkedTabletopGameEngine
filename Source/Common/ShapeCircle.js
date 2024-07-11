
class ShapeCircle
{
	constructor(radius)
	{
		this.radius = radius;
	}

	boundingRectangle()
	{
		if (this._boundingRectangle == null)
		{
			var size =
				new Coords(1, 1)
				.multiplyScalar(this.radius * 2);
			this._boundingRectangle = new ShapeRectangle(size);
		}

		return this._boundingRectangle;
	}

	containsPointForPos(pointToCheck, shapePos)
	{
		var distance = pointToCheck.clone().subtract(shapePos).magnitude();
		var returnValue = (distance <= this.radius);
		return returnValue;
	}

	draw(display, pos, colorFill, colorBorder)
	{
		display.drawCircle(pos, this.radius, colorFill, colorBorder);
	}

	transformScale(scaleFactor)
	{
		this.radius *= scaleFactor;
		return this;
	}

}