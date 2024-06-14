
class VisualOffset
{
	constructor(offset, child)
	{
		this.offset = offset || Coords.zeroes();
		this.child = child;
	}

	draw(display, pos)
	{
		pos.add(this.offset);
		this.child.draw(display, pos);
		pos.subtract(this.offset);
	}
}