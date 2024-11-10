importScripts("common.js");
importScripts("settings.js");

var locsettings =
{};
var settobj = new Settings();
var manifest = chrome.runtime.getManifest();
var storageID = "settings";

chrome.tabs.onZoomChange.addListener(listenerZoom);
chrome.runtime.onMessage.addListener(listenerOnMessageBG);


function log(msg)
{
	console.log(msg)
}


loadParameters(function(result)
{
});


chrome.tabs.onUpdated.addListener(function(tab)
{
	postZoomChanged();
});
chrome.tabs.onActivated.addListener(function(tab)
{
	postZoomChanged();
});

chrome.runtime.onInstalled.addListener(function(det)
{
	//log("onInstalled.addListener " + JSON.stringify(det));
	postZoomChanged();
});

chrome.management.onEnabled.addListener(function(det)
{
	if (det.id == chrome.runtime.id)
	{
		//log("onEnabled.addListener " + JSON.stringify(det));
		postZoomChanged();
	}

});


function postZoomChanged()
{
	chrome.tabs.getCurrent(function(tab)
	{
		chrome.tabs.getZoom(tab, function(zoom)
		{
			var zoomstr = Math.round(zoom * 100).toString();
			chrome.action.setBadgeText(
			{
				text : zoomstr,
				tabId : tab
			});
		});
	});
}

function listenerZoom(zinfo)
{
	postZoomChanged();
}

function listenerOnMessageBG(msg, sender, callback)
{
	//log("onMessage " + JSON.stringify(sender) + " " + msg.msg);

	if (msg.msg == Message.REQUEST_SETTINGS)
	{
		sendSettingsToContent(locsettings);
		if (callback)
		{
			callback(
			{
				status : 'ok'
			});
		}		
		return true;
	}

	if (msg.msg == Message.PING)
	{
		if (callback)
		{
			callback("PONG");
		}
		return false;
	}

	if (msg.msg == Message.ZOOM)
	{
		chrome.tabs.getCurrent(function(tab)
		{
			chrome.tabs.getZoom(tab, function(zprev)
			{
				var znew = 1;
				if (msg.dir != 0)
				{
					var incr = msg.incr;
					incr *= 10;
					znew = zprev * 1000 + (msg.direction > 0 ? incr : -incr);
					znew = Math.round(znew / incr) * incr;
					znew /= 1000;

				}
				if (znew > 0 && znew <= 5)
					chrome.tabs.setZoom(tab, znew, postZoomChanged);
			});

		});
	}
		
	return false;
}


function loadParameters(callback)
{

	chrome.storage.local.get(storageID, function(result)
	{
		var settings =
		{};

		var valid = false;
		try
		{
			valid = result.settings.version == settobj.version;
		} catch (err)
		{
		}

		if (!valid)
		{
			settings = settobj.defaultSettings();
		} else
		{
			settings = result.settings;
		}
		locsettings = settings;
		if (settings)
			sendSettingsToContent(settings);
		if (callback)
			callback(settings)
	});
}


