
class Display
{
	constructor(divID, size)
	{
		this.divID = divID;
		this.size = size;

		this.colorBack = "White";
		this.colorFore = "Gray";

		this._drawPos = Coords.create();
		this._zeroes = Coords.zeroes();
	}

	clear()
	{
		var g = this.graphics;
		g.fillStyle = this.colorBack;
		g.fillRect(0, 0, this.size.x, this.size.y);

		g.strokeStyle = this.colorFore;
		g.strokeRect(0, 0, this.size.x, this.size.y);
	}

	drawCircle(center, radius, color)
	{
		var g = this.graphics;

		g.beginPath();
		g.arc(center.x, center.y, radius, 0, Math.PI * 2);

		g.fillStyle = "White";
		g.fill();
		g.strokeStyle = color;
		g.stroke();
	}

	drawRay(vertex, orientation, length, color)
	{
		var g = this.graphics;
		g.strokeStyle = color;
		g.beginPath();
		g.moveTo(vertex.x, vertex.y);
		var drawPos = 
			this._drawPos.overwriteWith
			(
				orientation
			).multiplyScalar
			(
				length
			).add
			(
				vertex
			);

		g.lineTo(drawPos.x, drawPos.y);
		g.stroke();
	}

	drawRectangle(centerPos, size, colorFill, colorBorder)
	{
		var g = this.graphics;

		var drawPos =
			this._drawPos.overwriteWith(size).half().invert().add(centerPos);

		if (colorFill != null)
		{
			g.fillStyle = colorFill;
			g.fillRect(drawPos.x, drawPos.y, size.x, size.y);
		}

		if (colorBorder != null)
		{
			g.strokeStyle = color;
			g.strokeRect(drawPos.x, drawPos.y, size.x, size.y);
		}
	}

	drawText(text, heightInPixels, colorFill, colorBorder, drawPos)
	{
		var g = this.graphics;

		g.font = "" + heightInPixels + "px";
		var textWidth = g.measureText(text).width;

		if (colorBorder != null)
		{
			g.fillStyle = colorBorder;
			g.fillRect
			(
				drawPos.x - textWidth / 2,
				drawPos.y - heightInPixels, 
				textWidth,
				heightInPixels
			);
		}

		g.fillStyle = colorFill;
		g.fillText
		(
			text, 
			drawPos.x - textWidth / 2,
			drawPos.y
		);
	}

	fillWithColor(color)
	{
		var g = this.graphics;
		g.fillStyle = color;
		g.fillRect(0, 0, this.size.x, this.size.y);
	}

	initialize(document)
	{
		var canvas = document.createElement("canvas");
		canvas.width = this.size.x;
		canvas.height = this.size.y;
		this.canvas = canvas;

		this.graphics = canvas.getContext("2d");

		var divDisplay = document.getElementById(this.divID);
		divDisplay.innerHTML = "";
		divDisplay.appendChild(canvas);

		this.domElement = canvas;
	}
}
