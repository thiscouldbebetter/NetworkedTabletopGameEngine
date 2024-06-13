
class IDHelper
{
	static _idNext = 0;

	static IDNext()
	{
		return "_" + IDHelper._idNext++;
	};
}
