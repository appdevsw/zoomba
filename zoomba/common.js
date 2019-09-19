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
