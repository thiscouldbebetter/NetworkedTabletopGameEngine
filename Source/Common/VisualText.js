
class VisualText
{
	constructor(text, color)
	{
		this.text = text;
		this.color = color;
	}

	draw(display, pos)
	{
		display.drawText(this.text, pos, this.color);
	}
}