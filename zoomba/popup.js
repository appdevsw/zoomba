var keyboard = new Keyboard();
var settobj = new Settings();
var buttonReset;
var tabKeys = [ "Tab", "Shift Tab" ];
var specialKeys = [ "Tab", "Shift Tab", "Backspace" ];
var backspaceKey = "Backspace";

//populate listboxes in popup.html
function modifyDOM()
{
	//fill SELECT options with allowable increments
	var objs = document.getElementsByName("increment");
	for ( var i in objs)
	{
		var obj = objs[i];
		if (obj.name == "increment")
		{
			for (iv in settobj.increments)
			{
				var el = document.createElement("OPTION");
				el.innerHTML = settobj.increments[iv];
				obj.appendChild(el);
			}
		}
	}

	//create/clone hotkey input fields
	var keyobj1 = document.getElementById("tdid0");
	var keyobj2 = keyobj1.cloneNode(true);
	keyobj2.id = null;
	var par = keyobj1.parentNode;
	par.replaceChild(keyobj2, par.children[1]);

	var baseobj = document.getElementById("trid0");
	var rows = settobj.rowCount;
	for (var i = 1; i < rows; i++)
	{
		var clone = baseobj.cloneNode(true);
		clone.id = "trid" + i;
		baseobj.parentNode.appendChild(clone);
	}

}

document.addEventListener('DOMContentLoaded', function()
{
	modifyDOM();

	buttonReset = document.getElementById("defaultsettings");

	var bg = chrome.extension.getBackgroundPage();
	addEventListener("unload", function(event)
	{
		settings = settobj.DOMToSettings();
		bg.saveParameters(settings);
	}, true);

	var tab = settobj.getObjTabFromDOM();
	var evlist = [ 'keydown', 'keyup', 'mousewheel' ];
	//input fields listeners
	for ( var i in tab)
	{
		var oblist = [ tab[i].keyin, tab[i].keyout, tab[i].incrobj ];
		for (ei in evlist)
		{
			for ( var il in oblist)
			{
				oblist[il].addEventListener(evlist[ei], listenerOnKey);
			}
			if (i == 0)
				buttonReset.addEventListener(evlist[ei], listenerOnKey);
		}
	}
	buttonReset.addEventListener("click", function()
	{
		buttonReset.blur();
		settobj.settingsToDOM(settobj.defaultSettings());
	});

	chrome.runtime.getBackgroundPage(function(bg)
	{
		bg.loadParameters(function(settings)
		{
			//log("popup Settings loaded" + JSON.stringify(settings));
			if (!settings)
			{
				settings = defaultSettings();
				bg.saveParameters(settings);
			}
			settobj.settingsToDOM(settings)
		});
	});

});

function tooltip(e, txt)
{
	var r = e.getBoundingClientRect();
	var t = document.getElementById('tooltip');
	t.innerHTML = txt;
	var hide = specialKeys.indexOf(txt) >= 0 || txt == "";
	t.style.display = hide ? "none" : "block";
	t.style.background = "#FFFFDD";
	t.style.border = "1px solid gray";
	t.style["border-radius"] = "5px";
	t.style["padding"] = "5px";
	t.style.position = "absolute";
	var rd = t.getBoundingClientRect();
	t.style.left = (r.left) + "px";
	t.style.top = (r.top - (rd.bottom - rd.top)) + "px";
}

function listenerOnKey(e)
{
	//log("listenerOnKey " + e.type + " > " + e.target.className);
	keyboard.onEvent(e);

	tooltip(e.target, "");
	var keyseqall = keyboard.getKeyboardStateString();

	if (!e.target.className || e.target.className != "hotkey")
		return;
	tooltip(e.target, keyseqall);

	var keyseq = keyboard.getKeyboardStateString({
		keyOnly : true
	});
	if (tabKeys.indexOf(keyseq) >= 0)
		return;
	if (e.type == "keydown" && keyseq == "")
		return;

	if (e.type == "keydown" || e.type == "mousewheel")
	{
		if (keyseq == backspaceKey)
			e.target.value = "";
		else
			e.target.value = keyseq;
	}
	e.preventDefault();
	e.stopPropagation();

}