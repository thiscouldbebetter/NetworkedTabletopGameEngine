
class ColorHelper
{
	static random()
	{
		var hueMax = 360;
		var hue = Math.floor(Math.random() * hueMax);

		var returnValue = 
			"hsl(" + hue + ", 100%, 50%)";

		return returnValue;
	};
}
