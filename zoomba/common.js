function log(m)
{
	var debug = false; //true;
	if (debug)
	{
		if (typeof contentid != "undefined")
			console.log(contentid + ">" + m);
		else
			console.log(m);
	}
}

this.Messages = function()
{
	this.ZOOM = "ZOOM";
	this.REQUEST_SETTINGS = "REQUEST_SETTINGS";
	this.SETTINGS = "SETTINGS";
	this.PING = "PING";
}

var Message = new Messages();

this.Identifiers = function()
{
	this.WHEEL_INCR = "whincr";
	this.WHEEL_INCR2 = this.WHEEL_INCR + "2";
	this.WHEEL_INCR3 = this.WHEEL_INCR + "3";
	this.WHEEL_REV_DIR = "whrevdir";
	this.DRAG_ZOOM = "dragzoom";
	this.DRAG_ZOOM_REV_DIR = "dragzoomdir";
}

var IDS = new Identifiers();


function isSupportedTab(tab)
{
	var forbidden = [ "//chrome.google.com", "//addons.opera.com" ];
	for ( var f in forbidden)
	{
		if (tab.url.indexOf(forbidden[f]) >= 0)
			return false;
	}
	var prot = tab.url.split(new RegExp(":."))[0];
	if ([ "chrome", "opera", "view-source" ].indexOf(prot) >= 0)
		return false;
	return true;
}



function sendMessageToContent(message)
{
	chrome.tabs.query(
	{
		active : true
	}, function(tabs)
	{
		for ( var i in tabs)
		{
			if (!isSupportedTab(tabs[i]))
				continue;			
			chrome.tabs.sendMessage(tabs[i].id, message);
		}
	});
}

function sendSettingsToContent(settings)
{
	var message =
	{
		msg : Message.SETTINGS,
		settings : settings
	};
	sendMessageToContent(message);
}
