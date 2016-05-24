var Keyboard = function()
{
	//two wheel pseudo-keys used when the user is turning a mouse wheel inside settings input field
	this.WHEEL_IN = 301;
	this.WHEEL_OUT = 302;

	this.kbdstate = {};

	this.keymap = {
		//
		27 : 'Esc',
		42 : 'PrintScrn',
		145 : 'ScrollLock',
		19 : 'Break',
		//
		192 : 'Tilde',
		8 : 'Backspace',
		189 : '-',
		187 : '+',
		//			
		9 : 'Tab',
		219 : '[',
		221 : ']',
		220 : '\\',
		//
		20 : 'CapsLock',
		186 : ';',
		222 : "'",
		13 : 'Enter',
		//
		188 : ',',
		190 : '.',
		191 : '/',
		//
		32 : 'Space',
		93 : 'Menu',
		// navigation
		45 : 'Ins',
		46 : 'Del',
		36 : 'Home',
		35 : 'End',
		33 : 'PageUp',
		34 : 'PageDown',
		//
		37 : 'Left',
		38 : 'Up',
		39 : 'Right',
		40 : 'Down',
		// num
		144 : 'NumLock',
		111 : 'Num/',
		106 : 'Num*',
		109 : 'Num-',
		107 : 'Num+',
		12 : 'Num5key',
		//
		0 : ""
	//
	};

	this.keymap[this.WHEEL_IN] = "Mouse-Wheel-In";
	this.keymap[this.WHEEL_OUT] = "Mouse-Wheel-Out";

	var i;
	//digits
	for (i = 0; i <= 9; i++)
	{
		this.keymap[i + 48] = String.fromCharCode(i + 48);
		this.keymap[i + 96] = "Num" + String.fromCharCode(i + 48);
	}
	//letters
	for (i = 65; i <= 90; i++)
		this.keymap[i] = String.fromCharCode(i);
	//Fn keys
	for (i = 112; i <= 123; i++)
		this.keymap[i] = "F" + (i - 111);

	//Modifiers in a separate map
	this.modmap = { //
		17 : "Ctrl",
		18 : "Alt",
		225 : "Alt-Gr",
		16 : "Shift",
		91 : "Meta",
		92 : "Meta-right"
	};
	this.modord = [ 17, 18, 225, 16, 91, 92 ];

	for (i in this.modmap)
		this.keymap[i] = this.modmap[i];

	this.revkeymap = {};
	for (i in this.keymap)
		this.revkeymap[this.keymap[i]] = i;

	this.clearKey = function(keyCode)
	{
		if (this.kbdstate[keyCode])
			delete this.kbdstate[keyCode];
	};

	this.onEvent = function(event)
	{
		//console.log(event.type + " " + event.keyCode);
		this.clearKey(this.WHEEL_IN);
		this.clearKey(this.WHEEL_OUT);
		if (event.type == "keydown")
		{
			this.kbdstate[event.keyCode] = true;
		}
		if (event.type == "keyup")
		{
			this.clearKey(event.keyCode);
		}
		if (event.type == "mousewheel")
		{
			if (event.wheelDelta > 0)
				this.kbdstate[this.WHEEL_IN] = true;
			else
				this.kbdstate[this.WHEEL_OUT] = true;
		}
	};

	this.reset = function()
	{
		this.kbdstate = {};
	};

	this.getKeyState = function(keyCode)
	{
		if (this.kbdstate[keyCode])
			return true;
		return false;
	};

	this.getKeyName = function(keyCode)
	{
		var name = this.keymap[keyCode];
		if (name)
			return name
		return "key" + keyCode;
	};

	this.isModifier = function(keyCode)
	{
		return this.modmap[keyCode] ? true : false;
	};

	this.getKeyboardState = function(sort)
	{
		var keys = Object.keys(this.kbdstate)
		if (!sort)
			return keys;
		var ret = [];
		for ( var i in this.modord)
		{
			var idx = keys.indexOf("" + this.modord[i]);
			if (idx >= 0)
				ret.push(this.modord[i]);
		}
		for ( var i in keys)
			if (!this.isModifier(keys[i]))
				ret.push(keys[i]);

		return ret;
	};

	this.getKeyboardStateString = function(params)
	{
		var ids = this.getKeyboardState(true);
		if (ids.length == 0)
			return "";
		if (params)
		{
			if (params.wheelDelta)
				ids.push(params.wheelDelta > 0 ? this.WHEEL_IN : this.WHEEL_OUT);
			if (params.keyOnly && this.isModifier(ids[ids.length - 1]))
				return "";
		}
		var desc = "";
		for ( var i in ids)
		{
			desc += (i > 0 ? " " : "") + this.getKeyName(ids[i]);
		}

		return desc;
	};

	this.getKeyCodesFromString = function(s)
	{
		var names = s.split(" ");
		var ids = [];
		for (i in names)
		{

			name = names[i];
			if (name == "")
				break;
			kcode = this.revkeymap[name];
			if (!kcode)
			{
				if (name.startsWith("key"))
				{
					kcode = parseInt(name.substr(3));
				} else
					throw "BAD KEY SEQUENCE " + s;

			}
			ids.push(kcode);
		}
		return ids;
	}

	return this;

};