
class Display
{
	constructor(divID, size)
	{
		this.divID = divID;
		this.size = size;

		this.colorBack = "White";
		this.colorFore = "Gray";

		this._drawPos = new Coords();
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

	drawRectangle(pos, size, color)
	{
		var g = this.graphics;

		var drawPos =
			this._drawPos.overwriteWith(size).half().invert().add(pos);

		g.fillStyle = "White";
		g.fillRect(drawPos.x, drawPos.y, size.x, size.y);

		g.strokeStyle = color;
		g.strokeRect(drawPos.x, drawPos.y, size.x, size.y);
	}

	drawText(text, drawPos)
	{
		var g = this.graphics;
		g.fillStyle = this.colorFore;
		g.fillText
		(
			text, 
			drawPos.x - g.measureText(text).width / 2,
			drawPos.y
		);
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
