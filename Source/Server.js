class ClassFileLoaderAndParser
{
	classDeclarationsAsStringsGet()
	{
		var classDeclarationsAsStrings = [];

		var directoryRootPath = "./Common/";
		var classDeclarationsAsStrings =
			this.addFilesFromDirectoryAndDescendantsToArray(directoryRootPath, []);
		var classDeclarationsInFunctionParadigm =
			classDeclarationsAsStrings.map
			(
				x => this.convertClassDeclarationTextToFunctionPrototypeParadigm(x)
			);

		return classDeclarationsInFunctionParadigm;
	}

	addFilesFromDirectoryAndDescendantsToArray(directoryCurrentPath, arrayToAddTo)
	{
		var fs = require("fs");
		var filesystemEntriesInDirectoryCurrent =
			fs.readdirSync(directoryCurrentPath);
		for (var i = 0; i < filesystemEntriesInDirectoryCurrent.length; i++)
		{
			var filesystemEntryName =
				filesystemEntriesInDirectoryCurrent[i];
			var filesystemEntryPath =
				directoryCurrentPath + filesystemEntryName;

			var stat = fs.statSync(filesystemEntryPath);

			if (stat.isDirectory() )
			{
				var subdirectoryPath = filesystemEntryPath + "/";
				this.addFilesFromDirectoryAndDescendantsToArray
				(
					subdirectoryPath, arrayToAddTo
				);
			}
			else
			{
				var fileName = filesystemEntryName;
				var filePath = filesystemEntryPath;
				var fileContents = fs.readFileSync(filePath).toString();
				arrayToAddTo.push(fileContents);
			}
		}

		return arrayToAddTo;
	}

	convertClassDeclarationTextToFunctionPrototypeParadigm(fileContents)
	{
		// Node.js's eval() doesn't understand the class-method paradigm.

		var newline = "\n";

		fileContents = fileContents.split("\r\n").join(newline);

		var linesBefore = fileContents.split(newline);
		var linesAfter = [];
		var className = "";
		var constructorKeywordOrMethodHeaderEncounteredSincePreviousClassKeyword = true;

		for (var i = 0; i < linesBefore.length; i++)
		{
			var lineBefore = linesBefore[i];
			var lineBeforeTrimmed = lineBefore.trim();

			var lineAfter;
			if (lineBeforeTrimmed == "")
			{
				lineAfter = "";
			}
			else if (lineBefore.startsWith("class ") )
			{
				constructorKeywordOrMethodHeaderEncounteredSincePreviousClassKeyword = false;

				className = lineBefore.split(" ")[1];
				lineAfter = lineBefore.split("class ").join("\tfunction ");

				i++;
				while (linesBefore[i] != "{")
				{
					i++;
				}
			}
			else if (lineBefore.startsWith("\tconstructor") )
			{
				constructorKeywordOrMethodHeaderEncounteredSincePreviousClassKeyword = true;
				lineAfter = lineBefore.split("constructor").join("");
			}
			else if
			(
				lineBefore[0] == "\t"
				&& lineBefore[1] != "\t"
				&& lineBefore[1] != "{"
				&& lineBefore[1] != "}"
				&& lineBefore[1] != "("
				&& lineBefore[1] != ")"
				&& lineBefore.startsWith("\t//") == false
			)
			{
				// It's a method header.
				
				if (constructorKeywordOrMethodHeaderEncounteredSincePreviousClassKeyword == false)
				{
					linesAfter.push("()\n{}");
					constructorKeywordOrMethodHeaderEncounteredSincePreviousClassKeyword = true;
				}

				var lineBeforeTrimmed = lineBefore.trim();
				if (lineBeforeTrimmed.startsWith("static ") )
				{
					lineBeforeTrimmed = lineBeforeTrimmed.substring("static ".length);
					var lineBeforeParts = lineBeforeTrimmed.split("(");
					var methodName = lineBeforeParts[0];
					lineAfter = "\t" + className + "." + methodName;

					if (lineBeforeTrimmed.endsWith(";") == false)
					{
						lineAfter += " = function";
					}

					if (lineBeforeParts.length > 1)
					{
						lineAfter += "(";
						var lineBeforeRemainder = lineBeforeParts[1];
						lineAfter += lineBeforeRemainder;
					}
				}
				else
				{
					var lineBeforeParts = lineBeforeTrimmed.split("(");
					var methodName = lineBeforeParts[0];
					lineAfter = "\t" + className + ".prototype." + methodName + " = function";
					if (lineBeforeParts.length > 1)
					{
						lineAfter += "(";
						var lineBeforeRemainder = lineBeforeParts[1];
						lineAfter += lineBeforeRemainder;
					}
				}
			}
			else if (lineBefore.startsWith("}") )
			{
				// Do nothing.
				lineAfter = "";
			}
			else
			{
				lineAfter = lineBefore;
			}

			linesAfter.push(lineAfter);
		}

		var fileContentsAfter = linesAfter.join(newline);

		return fileContentsAfter;
	}
}

class ClientConnection
{
	constructor(server, clientID, socket)
	{
		this.server = server;
		this.clientID = clientID;
		this.socket = socket;

		this.socket.on
		(
			"identify", 
			this.handleEvent_ClientIdentifyingSelf.bind(this)
		);
	}

	handleEvent_ClientDisconnected()
	{
		console.log("Someone left the server.")
		var bodies = this.server.world.bodies;
		var bodyToDestroy = bodies[this.clientID];
		if (bodyToDestroy != null)
		{
			bodyToDestroy.isDisconnected = true;
		}
	}

	handleEvent_ClientIdentifyingSelf(clientName)
	{
		this.clientName = clientName;

		var server = this.server;

		var clientConnection = server.clientConnections[this.clientID];
		var socketToClient = clientConnection.socket;

		var session = new Session(this.clientID, server.world);
		var sessionSerialized = server.serializer.serialize(session);
		socketToClient.emit("sessionEstablished", sessionSerialized);

		var world = server.world;
		var bodyDefnPlayer = world.bodyDefns["Player"];
		var bodyDefnForClient = bodyDefnPlayer.clone();
		bodyDefnForClient.name = this.clientID;
		bodyDefnForClient.color = ColorHelper.random();

		var updateBodyDefnRegister = new Update_BodyDefnRegister
		(
			bodyDefnForClient
		);
		updateBodyDefnRegister.updateWorld(world);
		world.updatesOutgoing.push(updateBodyDefnRegister);

		var bodyForClient = new Body
		(
			this.clientID, // id
			clientName, // name
			bodyDefnForClient.name,
			new Coords().randomize().multiply(world.size),
			new Coords().randomize().normalize()
		);
		
		var updateBodyCreate = new Update_BodyCreate(bodyForClient);
		world.updatesOutgoing.push(updateBodyCreate);
		updateBodyCreate.updateWorld(world);

		socketToClient.on
		(
			"update",
			this.handleEvent_ClientUpdateReceived.bind(this)
		);
		
		socketToClient.on
		(
			"disconnect",
			this.handleEvent_ClientDisconnected.bind(this)
		);

		console.log(clientName + " joined the server.");
	}

	handleEvent_ClientUpdateReceived(updateSerialized)
	{
		var serializer;
		var firstChar = updateSerialized[0];
		
		if (firstChar == "{") // JSON
		{
			serializer = this.server.serializer;
		}
		else // terse
		{
			var updateCode = firstChar;
			if (updateCode == Update_Actions.UpdateCode)
			{
				serializer = new Update_Actions();
			}
		}

		var update = serializer.deserialize
		(
			updateSerialized
		);

		update.updateWorld(this.server.world);
	}
}

class Server
{
	constructor(portToListenOn, world)
	{
		this.portToListenOn = portToListenOn;
		this.world = world;
	}

	initialize()
	{
		this.clientConnections = [];

		Log.IsEnabled = true;

		this.serializer = new Serializer;

		this.clientID = IDHelper.IDNext();

		this.updatesIncoming = [];

		var socketIO = require("socket.io");
		var server = new socketIO.Server
		(
			this.portToListenOn,
			{ log: false }
		);

		server.on
		(
			"connection",
			this.handleEvent_ClientConnecting.bind(this)
		);

		console.log("Server started at " + new Date().toLocaleTimeString());
		console.log("Listening on port " + this.portToListenOn + "...");

		setInterval
		(
			this.updateForTick.bind(this),
			this.world.millisecondsPerTick()
		);
	}

	updateForTick()
	{
		var world = this.world;

		world.updateForTick_UpdatesApply(this.updatesIncoming);

		world.updateForTick_Spawn();

		this.updateForTick_Server();

		world.updateForTick_UpdatesApply(world.updatesImmediate);

		world.updateForTick_Remove();

		this.updateForTick_UpdatesOutgoingSend();
	}

	updateForTick_Server()
	{
		var world = this.world;
		var bodies = world.bodies;

		for (var i = 0; i < bodies.length; i++)
		{
			var body = bodies[i];
			body.updateForTick_Connectivity(world);
			body.updateForTick_Actions(this, world);
		}
	}

	updateForTick_UpdatesOutgoingSend()
	{
		var world = this.world;

		for (var i = 0; i < world.updatesOutgoing.length; i++)
		{
			var update = world.updatesOutgoing[i];
			var serializer = (update.serialize == null ? this.serializer : update);
			var updateSerialized = serializer.serialize(update);

			for (var c = 0; c < this.clientConnections.length; c++)
			{
				var clientConnection = this.clientConnections[c];
				var socketToClient = clientConnection.socket;
				socketToClient.emit("update", updateSerialized);
			}
		}
		world.updatesOutgoing.length = 0;
	}

	// events

	handleEvent_ClientConnecting(socketToClient)
	{
		var clientIndex = this.clientConnections.length;
		var clientID = "C_" + clientIndex;

		var clientConnection = new ClientConnection(this, clientID, socketToClient);
		this.clientConnections.push(clientConnection);
		this.clientConnections[clientID] = clientConnection;

		socketToClient.emit("connected", clientID);
	}
}

function main()
{
	var args = process.argv;

	var argsByName = new Map();

	for (var a = 2; a < args.length; a++)
	{
		var arg = args[a];

		var argParts = arg.split("=");

		var argName = argParts[0];
		var argValue = argParts[1];

		argsByName.set(argName, argValue);
	}

	var argDefaultsByName = new Map
	([
		[ "--port", "8089" ],
		[ "-a", "128" ],
		[ "-p", "10" ],
		[ "-s", "3" ],
		[ "-b", "1" ]
	]);

	var argNames = argDefaultsByName.keys();
	for (var argName of argNames)
	{
		if (argsByName.has(argName) == false)
		{
			var argValueDefault = argDefaultsByName.get(argName);
			argsByName.set(argName, argValueDefault);
		}
	}

	var servicePort = parseInt(argsByName.get("--port") );
	var arenaSize = parseInt(argsByName.get("-a") );

	var world = World.default();

	new Server(servicePort, world).initialize();
}

// If eval() is called from within a function or method,
// the classes arent declared within the global scope,
// and are therefore become unavailable as soon as the host method
// goes out of scope.

var classFileLoaderAndParser =
	new ClassFileLoaderAndParser();

var classDeclarationsAsStrings =
	classFileLoaderAndParser.classDeclarationsAsStringsGet();

for (var i = 0; i < classDeclarationsAsStrings.length; i++)
{
	var classDeclarationAsString = classDeclarationsAsStrings[i];
	eval(classDeclarationAsString);
}

main();
