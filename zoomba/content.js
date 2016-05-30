//
if (contentid) //skip duplicate content instances
{
	log("Prevoiusly injected content is active. Re-injection is not required.");
} else
{
	var contentid = Math.round(Math.random() * 1e12);
	var keyboard = new Keyboard();
	var settings = {};
	var disconnected;

	log("new content script id " + contentid);

	MAIN();
}

//
//

function MAIN()
{
	setListeners(false);
	setListeners(true);
	checkIsConnected();
	sendContentMessage({
		msg : Message.REQUEST_SETTINGS
	});
}

function sendZoomMessage(direction, incr)
{
	zoomMsg = {
		msg : Message.ZOOM,
		direction : direction,
		incr : incr
	};
	log("send  message " + JSON.stringify(zoomMsg));
	sendContentMessage(zoomMsg, function(response)
	{
	});
}

//disable current content instance after the background.js goes inactive
function checkIsConnected()
{
	if (disconnected)
		return false;
	try
	{
		sendContentMessage({
			msg : Message.PING
		});
		return true;
	} catch (err)
	{
		setListeners(false);
		log("Connection broken! Content script " + contentid + " was disabled.");
		disconnected = true;
	}

	return false;
}

function setListeners(enable)
{
	//log("set listeners " + enable);
	var evlist = [ "focus", "mousewheel", "keydown", "keyup" ];
	evlist.forEach(function(e)
	{

		var obj = window;
		if (e.indexOf("wheel") >= 0)
			obj = document;
		if (enable)
		{
			obj.removeEventListener(e, listener);
			obj.addEventListener(e, listener);
		} else
			obj.removeEventListener(e, listener);
	});

	try
	{
		if (enable)
			chrome.extension.onMessage.addListener(listenerOnMessage);
		else
			chrome.extension.onMessage.removeListener(listenerOnMessage);
	} catch (err)
	{
		//log("remove onMessage listener error " + err);
	}

}

function listener(event)
{

	if (!checkIsConnected())
	{
		return;
	}

	switch (event.type) {
	case "focus":
		listenerFocus(event);
		break;
	case "mousewheel":
		listenerWheel(event);
		break;
	case "onmousewheel":
		listenerWheel(event);
		break;
	case "keyup":
		listenerKeyUp(event);
		break;
	case "keydown":
		listenerKeyDown(event);
		break;
	default:
		throw ("switch/case error");
	}
}

function listenerFocus(event)
{
	//log("focus");
	keyboard.reset();
}

function findPressedObj(kbdStateStr)
{
	var found;
	for (i in settings)
	{
		var pos = settings[i];
		if (pos.incr && (kbdStateStr == pos.keyin || kbdStateStr == pos.keyout))
		{
			found = pos;
			found.dir = kbdStateStr == pos.keyin ? 1 : -1;
			break;
		}
	}

	return found;
}

function listenerWheel(event)
{
	//join the keyboard state with a wheel pseudo key
	var kbdStateStr = keyboard.getKeyboardStateString({
		wheelDelta : event.wheelDelta
	});

	var found = findPressedObj(kbdStateStr);
	if (found)
	{
		event.preventDefault();
		event.stopPropagation();
		sendZoomMessage(found.dir, found.incr);
	}
}

function listenerKeyDown(event)
{
	keyboard.onEvent(event);
	log(event.type + " " + event.keyCode);
	if (!settings)
	{
		throw ("Content settings not defined!");
	}

	var found = findPressedObj(keyboard.getKeyboardStateString());
	if (found)
	{
		event.preventDefault();
		event.stopPropagation();
		sendZoomMessage(found.dir, found.incr);

	}
}

function listenerKeyUp(event)
{
	keyboard.onEvent(event);
}

function listenerOnMessage(msg, sender, callback)
{
	//log("received message " + JSON.stringify(msg));
	log("received message " + msg.msg);
	if (msg.msg == Message.SETTINGS)
	{
		settings = msg.settings;
	}
};

function sendContentMessage(msg, callback)
{
	msg.contentid = contentid;
	chrome.runtime.sendMessage(msg, callback);
}
