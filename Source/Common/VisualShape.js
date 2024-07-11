
class VisualShape
{
	constructor(shape, colorFill, colorBorder)
	{
		this.shape = shape;
		this.colorFill = colorFill;
		this.colorBorder = colorBorder;
	}

	draw(display, pos)
	{
		this.shape.draw
		(
			display, pos, this.colorFill, this.colorBorder
		);
	}
}