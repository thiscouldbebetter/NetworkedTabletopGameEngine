
class VisualText
{
	constructor(text, heightInPixels, colorFill, colorBorder)
	{
		this.text = text;
		this.heightInPixels = heightInPixels;
		this.colorFill = colorFill;
		this.colorBorder = colorBorder;
	}

	draw(display, pos)
	{
		display.drawText
		(
			this.text,
			this.heightInPixels,
			this.colorFill, this.colorBorder,
			pos
		);
	}
}