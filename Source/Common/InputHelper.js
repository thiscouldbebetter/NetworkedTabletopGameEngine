
class InputHelper
{
	constructor()
	{
		this.mousePos = new Coords();
	}

	initialize(document, display)
	{
		this.inputNamesActive = [];
		this.inputNamesActiveByInputName = new Map();

		var d = document;
		var body = d.body;
		body.onkeydown = this.handleEventKeyDown.bind(this);
		body.onkeyup = this.handleEventKeyUp.bind(this);

		var canvas = display.canvas;
		canvas.onmousedown = this.handleEventMouseDown.bind(this);
		canvas.onmousemove = this.handleEventMouseMove.bind(this);
	};

	inputAdd(inputName)
	{
		if (this.inputNamesActiveByInputName.has(inputName) == false)
		{
			this.inputNamesActive.push(inputName);
			this.inputNamesActiveByInputName.set(inputName, inputName);
		}
	}

	inputRemove(inputName)
	{
		var inputNameIndex = this.inputNamesActive.indexOf(inputName);
		if (inputNameIndex >= 0)
		{
			this.inputNamesActive.splice(inputNameIndex, 1);
			this.inputNamesActiveByInputName.delete(inputName);
		}
	}

	// events

	handleEventKeyDown(event)
	{
		this.inputAdd(event.key);
	};

	handleEventKeyUp(event)
	{
		this.inputRemove(event.key);
	};

	handleEventMouseDown(event)
	{
		var canvasClientRect = event.target.getClientRects()[0];
		this.mousePos.overwriteWithXY
		(
			event.clientX - canvasClientRect.x,
			event.clientY - canvasClientRect.y
		);
		this.inputAdd("MouseDown");
	}

	handleEventMouseMove(event)
	{
		var canvasClientRect = event.target.getClientRects()[0];
		this.mousePos.overwriteWithXY
		(
			event.clientX - canvasClientRect.x,
			event.clientY - canvasClientRect.y
		);
		this.inputAdd("MouseMove");
	}

}
