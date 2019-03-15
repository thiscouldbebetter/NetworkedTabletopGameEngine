
function VisualText(text, color)
{
	this.text = text;
	this.color = color;
}
{
	VisualText.prototype.draw = function(display, pos)
	{
		display.drawText(this.text, pos, this.color);
	}
}