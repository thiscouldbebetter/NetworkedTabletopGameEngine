

class Log
{
	static IsEnabled = false;

	static write(message)
	{
		if (Log.IsEnabled)
		{
			console.log(message);
		}
	};
}
