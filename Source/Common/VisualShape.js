
class VisualShape
{
	constructor(shape, color)
	{
		this.shape = shape;
		this.color = color;
	}

	draw(display, pos)
	{
		this.shape.draw(display, pos, this.color);
	}
}