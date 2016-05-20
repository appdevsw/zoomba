function log(m)
{
	if (true)
	//if (false)
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
