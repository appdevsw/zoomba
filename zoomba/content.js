if (contentid) //skip duplicate content instances
{
	console.log("Prevoiusly injected content is active. Re-injection is not required.");
} else
{
	

	var contentid = Math.round(Math.random() * 1e12);
	var keyboard = new Keyboard();
	var settings =
	{};
	var disconnected;
	var dragCount = 0;

	MAIN();
}

//
//

function MAIN()
{
	setListeners(false);
	setListeners(true);
	checkIsConnected();
	sendMessageToBackground(
	{
		msg : Message.REQUEST_SETTINGS
	});

}

function listenerOnMessage(msg, sender, callback)
{

	if (msg.msg == Message.SETTINGS)
	{
		settings = msg.settings;
	}

	
	if (callback)
	{
		callback(
		{
			status : 'ok'
		});
	}

	return true;
};

function sendZoomMessage(direction, incr)
{
	zoomMsg =
	{
		msg : Message.ZOOM,
		direction : direction,
		incr : incr
	};
	log("send  message " + JSON.stringify(zoomMsg));
	sendMessageToBackground(zoomMsg);
}

//disable current content instance after the background.js goes inactive
function checkIsConnected()
{
	if (disconnected)
		return false;
	try
	{
		sendMessageToBackground(
		{
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
	var evlist = [ "focus", "mousewheel", "keydown", "keyup", "mousemove", "contextmenu" ];
	evlist.forEach(function(e)
	{

		var obj = window;
		if (e.indexOf("wheel") >= 0)
			obj = document;
		if (enable)
		{
			obj.removeEventListener(e, listener);
			obj.addEventListener(e, listener,
			{
				passive : false
			}); //v 1.2.1 - fix event.preventDefault() error 
		} else
			obj.removeEventListener(e, listener);
	});

	try
	{
		if (enable)
			{
			chrome.runtime.onMessage.addListener(listenerOnMessage);
			}
		else
			{
			chrome.runtime.onMessage.removeListener(listenerOnMessage);
			}
	} catch (err)
	{
		//log("remove onMessage listener error " + err);
	}

}

function listener(event)
{
	switch (event.type)
	{
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
	case "mousemove":
		listenerMouseMove(event);
		break;
	case "contextmenu":
		listenerContextMenu(event);
		break;
	default:
		throw ("switch/case error");
	}
}

function listenerFocus(event)
{
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

	if (event.buttons > 0 && settings.wheel) //mouse-only zoom
	{
		var incr, dir;

		for (var i = 1; i <= 3; i++)
		{
			if (event.buttons == i && settings.wheel[IDS.WHEEL_INCR + i])
			{
				incr = settings.wheel[IDS.WHEEL_INCR + i];
				dir = settings.wheel[IDS.WHEEL_REV_DIR + i] ? -1 : 1;
				dir = dir * event.wheelDelta;
			}
		}
		if (incr)
		{
			event.preventDefault();
			event.stopPropagation();
			sendZoomMessage(dir, incr);
		}
		return;
	}

	//join the keyboard state with a wheel pseudo key
	var kbdStateStr = keyboard.getKeyboardStateString(
	{
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

function listenerMouseMove(event)
{
	if (event.buttons == 3 && settings[IDS.DRAG_ZOOM] == true)
	{
		if (dragCount++ > 2)
		{
			event.preventDefault();
			event.stopPropagation();
			var dir = event.movementY > 0 ? -1 : 1;
			if (settings[IDS.DRAG_ZOOM_REV_DIR] == true)
				dir = -dir;
			var incr = Math.abs(event.movementY);
			if (incr <= 3)
				incr = 1;
			sendZoomMessage(dir, incr);
		}
	}
	if (event.buttons != 3)
		dragCount = 0;
}

function listenerContextMenu(event)
{
	//block the context menu when both mouse buttons are pressed
	if (event.buttons == 3 && settings.wheel)
		if (settings[IDS.DRAG_ZOOM] == true || settings.wheel[IDS.WHEEL_INCR2] || settings.wheel[IDS.WHEEL_INCR3])

		{
			event.preventDefault();
			event.stopPropagation();
		}
}


function sendMessageToBackground(msg)
{
	msg.contentid = contentid;
	//console.log("szw sendMessageToBackground: "+JSON.stringify(msg));	
	chrome.runtime.sendMessage(msg);
}
