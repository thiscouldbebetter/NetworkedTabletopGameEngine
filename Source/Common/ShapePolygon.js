
class ShapePolygon
{
	constructor(vertices)
	{
		this.vertices = vertices;
	}

	boundingRectangle()
	{
		if (this._boundingRectangle == null)
		{
			var min = this.vertices[0].clone();
			var max = min.clone();

			for (var i = 1; i < this.vertices.length; i++)
			{
				var vertex = this.vertices[i];

				if (vertex.x < min.x)
				{
					min.x = vertex.x;
				}
				if (vertex.x > max.x)
				{
					max.x = vertex.x;
				}

				if (vertex.y < min.y)
				{
					min.y = vertex.y;
				}
				if (vertex.y > max.y)
				{
					max.y = vertex.y;
				}
			}

			var size = max.subtract(min);

			this._boundingRectangle = new ShapeRectangle(size);
		}

		return this._boundingRectangle;
	}

	containsPointForPos(pointToCheck, shapePos)
	{
		// hack
		var rectangle = this.boundingRectangle();
		return rectangle.containsPointForPos(pointToCheck, shapePos);
	}

	draw(display, pos, colorFill, colorBorder)
	{
		display.drawPolygonWithVerticesAtPos(this.vertices, pos, colorFill, colorBorder);
	}

	transformScale(scaleFactor)
	{
		this.vertices.forEach(x => x.multiplyScalar(scaleFactor) );
		return this;
	}

	transformTranslate(offset)
	{
		this.vertices.forEach(x => x.add(offset) );
		return this;
	}

}