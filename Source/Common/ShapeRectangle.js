
class ShapeRectangle
{
	constructor(size)
	{
		this.size = size;

		this._posRelative = new Coords();
	}

	static fromSize(size)
	{
		return new ShapeRectangle(size);
	}

	boundingRectangle()
	{
		return this;
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

	draw(display, pos, colorFill, colorBorder)
	{
		display.drawRectangle(pos, this.size, colorFill, colorBorder);
	}

	max()
	{
		if (this._max == null)
		{
			return this.size.clone().half();
		}
		return this._max;
	}

	min()
	{
		if (this._min == null)
		{
			return this.size.clone().half().invert();
		}
		return this._min;
	}

	transformScale(scaleFactor)
	{
		this.size.multiplyScalar(scaleFactor);
		return this;
	}

}