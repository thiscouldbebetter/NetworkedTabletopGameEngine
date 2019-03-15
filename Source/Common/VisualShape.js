
function VisualShape(shape, color)
{
	this.shape = shape;
	this.color = color;
}
{
	VisualShape.prototype.draw = function(display, pos)
	{
		this.shape.draw(display, pos, this.color);
	}
}