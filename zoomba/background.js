var locsettings = {};
var settobj = new Settings();
var manifest = chrome.runtime.getManifest();
var storageID = "settings";

chrome.tabs.onZoomChange.addListener(listenerZoom);
chrome.runtime.onMessage.addListener(listenerOnMessage);

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
	injectContent();
	postZoomChanged();
});

chrome.management.onEnabled.addListener(function(det)
{
	if (det.id == chrome.runtime.id)
	{
		//log("onEnabled.addListener " + JSON.stringify(det));
		injectContent();
		postZoomChanged();
	}

});

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

// re-inject content scripts to the tabs	
function injectContent()
{
	//log("injectContent");
	var scripts = manifest.content_scripts[0].js;
	chrome.tabs.query({}, function(tabs)
	{
		for ( var i in tabs)
		{
			if (!isSupportedTab(tabs[i]))
				continue;
			//log("inject content to tab " + tabs[i].id + " " + tabs[i].url.substr(0, 30));
			for ( var si in scripts)
			{
				try
				{
					script = scripts[si];
					//log("inject content " + script + " to tab " + tabs[i].id + " " + tabs[i].url.substr(0, 30));
					chrome.tabs.executeScript(tabs[i].id, {
						file : script
					});

				} catch (err)
				{
					log("inject error " + err);
				}
			}
		}

	});
}

function postZoomChanged()
{
	chrome.tabs.getCurrent(function(tab)
	{
		chrome.tabs.getZoom(tab, function(zoom)
		{
			var zoomstr = Math.round(zoom * 100).toString();
			chrome.browserAction.setBadgeText({
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

function listenerOnMessage(msg, sender, callback)
{
	//log("onMessage " + JSON.stringify(sender) + " " + msg.msg);
	log("onMessage " + msg.msg);

	if (msg.msg == Message.REQUEST_SETTINGS)
	{
		sendSettingsToContent(locsettings);
		return false;
	}

	if (msg.msg == Message.PING)
	{
		if (callback)
		{
			callback()
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

function saveParameters(settings)
{
	//log("Save parameters " + JSON.stringify(settings));
	locsettings = settings;
	settings.version = settobj.version;
	var data = {};
	data[storageID] = settings;
	chrome.storage.local.set(data, function()
	{
		//log("Settings saved " + JSON.stringify(settings));
	});
	sendSettingsToContent(settings);

}

function loadParameters(callback)
{
	//log("CLEAR STORAGE !!! TEST");
	//chrome.storage.local.clear();

	chrome.storage.local.get(storageID, function(result)
	{
		//if (result)
		//	log("Settings loaded " + JSON.stringify(result) + " sett " + result.settings);
		var settings = {};

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

function sendSettingsToContent(settings)
{
	var message = {
		msg : Message.SETTINGS,
		settings : settings
	};
	sendMessageToContent(message);
}

function sendMessageToContent(message)
{

	chrome.tabs.query({}, function(tabs)
	{
		for ( var i in tabs)
		{
			if (!isSupportedTab(tabs[i]))
				continue;
			chrome.tabs.sendMessage(tabs[i].id, message);
		}
	});
}
