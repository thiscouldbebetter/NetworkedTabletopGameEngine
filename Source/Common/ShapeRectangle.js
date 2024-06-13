
class ShapeRectangle
{
	constructor(size)
	{
		this.size = size;

		this._posRelative = new Coords();
	}

	containsPointForPos(pointToCheck, shapePos)
	{
		var posRelative =
			this._posRelative
				.overwriteWith(this.size)
				.half()
				.invert()
				.add(shapePos)
				.invert()
				.add(pointToCheck);
		var returnValue = posRelative.isInRangeMax(this.size);
		return returnValue;
	}

	draw(display, pos, color)
	{
		display.drawRectangle(pos, this.size, color);
	}
}