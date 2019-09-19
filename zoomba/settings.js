var Settings = function()
{
	this.version = 2;
	this.increments = [ "", 1, 2, 2.5, 5, 10, 12.5, 15, 20, 25, 30, 33.33, 40, 50 ];
	this.rowCount = 8;

	this.defaultSettings = function()
	{
		var settings = {};

		settings[0] = {
			keyin : "Ctrl Mouse-Wheel-In",
			keyout : "Ctrl Mouse-Wheel-Out",
			incr : 10
		};
		settings[1] = {
			keyin : "Ctrl +",
			keyout : "Ctrl -",
			incr : 10
		};
		settings[2] = {
			keyin : "Ctrl Shift Mouse-Wheel-In",
			keyout : "Ctrl Shift Mouse-Wheel-Out",
			incr : 5
		};
		settings[3] = {
			keyin : "Ctrl Shift +",
			keyout : "Ctrl Shift -",
			incr : 5
		};

		settings.wheel = {};
		settings[IDS.DRAG_ZOOM] = false;
		settings[IDS.DRAG_ZOOM_REV_DIR] = false;
		//log("defaultSettings " + JSON.stringify(settings));
		return settings;
	};

	this.getObjRowFromTR = function(idx, trnode)
	{
		var ret = {
			idx : idx,
			keyin : trnode.children[0].children[0],
			keyout : trnode.children[1].children[0],
			incrobj : trnode.children[2].children[0]
		};
		return ret;
	};

	this.getObjTabFromDOM = function()
	{
		var ret = [];
		for (var i = 0; i < 99; i++)
		{
			var obj = document.getElementById("trid" + i);
			if (!obj)
				break;
			ret.push(this.getObjRowFromTR(i, obj))
		}
		return ret;
	};

	this.DOMToSettings = function()
	{
		var settings = {};
		var tab = this.getObjTabFromDOM();
		for ( var i in tab)
		{
			var o = tab[i];
			if (o.keyin.value == "" && o.keyout.value == "")
				continue;
			var tabpos = {
				keyin : o.keyin.value,
				keyout : o.keyout.value,
				incr : o.incrobj.value
			};
			settings[o.idx] = tabpos;
		}

		settings.wheel = {};
		for (var i = 1; i <= 3; i++)
		{
			var id = IDS.WHEEL_INCR + i;
			var obj = document.getElementById(id);
			if (obj)
				settings.wheel[id] = obj.children[0].value;
			var id = IDS.WHEEL_REV_DIR + i;
			var obj = document.getElementById(id);
			if (obj)
				settings.wheel[id] = obj.checked;
		}

		var obj = document.getElementById(IDS.DRAG_ZOOM);
		if (obj)
		{
			settings[IDS.DRAG_ZOOM] = obj.checked;
			settings[IDS.DRAG_ZOOM_REV_DIR] = document.getElementById(IDS.DRAG_ZOOM_REV_DIR).checked;
		}

		//log("DOMToSettings " + JSON.stringify(settings));

		return settings;
	};

	this.settingsToDOM = function(settings)
	{
		//log("settingsToDOM " + JSON.stringify(settings));
		var tab = this.getObjTabFromDOM();
		for ( var i in tab)
		{
			var o = tab[i];
			o.idx = i;
			if (!settings[i])
			{
				o.keyin.value = "";
				o.keyout.value = "";
				o.incrobj.value = "";
				continue;
			}
			o.keyin.value = settings[i].keyin;
			o.keyout.value = settings[i].keyout;
			o.incrobj.value = settings[i].incr;
		}

		if (settings.wheel)
		{
			for (var i = 1; i <= 3; i++)
			{
				var id = IDS.WHEEL_INCR + i;
				var obj = document.getElementById(id);
				if (obj)
					obj.children[0].value = settings.wheel[id];
				var id = IDS.WHEEL_REV_DIR + i;
				var obj = document.getElementById(id);
				if (obj)
					obj.checked = settings.wheel[id];
			}

		}

		var obj = document.getElementById(IDS.DRAG_ZOOM);
		if (obj)
		{
			obj.checked = (settings[IDS.DRAG_ZOOM] == true);
			document.getElementById(IDS.DRAG_ZOOM_REV_DIR).checked = (settings[IDS.DRAG_ZOOM_REV_DIR] == true);
		}
	};

};