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
