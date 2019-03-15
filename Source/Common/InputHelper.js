
function InputHelper()
{
	this.mousePos = new Coords();
}

{
	InputHelper.prototype.initialize = function(document, display)
	{
		this.inputNamesActive = [];
		var body = document.body;
		body.onkeydown = this.handleEventKeyDown.bind(this);
		body.onkeyup = this.handleEventKeyUp.bind(this);
		
		var canvas = display.canvas;
		canvas.onmousedown = this.handleEventMouseDown.bind(this);
		canvas.onmousemove = this.handleEventMouseMove.bind(this);
	};

	InputHelper.prototype.inputAdd = function(inputName)
	{
		if (this.inputNamesActive[inputName] == null)
		{
			this.inputNamesActive.push(inputName);
			this.inputNamesActive[inputName] = inputName;
		}
	}

	InputHelper.prototype.inputRemove = function(inputName)
	{
		this.inputNamesActive.remove(inputName);
		delete this.inputNamesActive[inputName];
	}

	// events

	InputHelper.prototype.handleEventKeyDown = function(event)
	{
		this.inputAdd(event.key);
	};

	InputHelper.prototype.handleEventKeyUp = function(event)
	{
		this.inputRemove(event.key);
	};

	InputHelper.prototype.handleEventMouseDown = function(event)
	{
		var canvasClientRect = event.target.getClientRects()[0];
		this.mousePos.overwriteWithXY
		(
			event.clientX - canvasClientRect.x,
			event.clientY - canvasClientRect.y
		);
		this.inputAdd("MouseDown");
	}

	InputHelper.prototype.handleEventMouseMove = function(event)
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
