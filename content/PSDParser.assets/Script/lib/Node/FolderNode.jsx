function FolderNode()
{
    BaseNode.apply(this, arguments);
}
defineSubClass(BaseNode, FolderNode);

FolderNode.prototype.calculateBounds = function()
{
	if(this.children.length == 0)
	{
		this.x = 0;
		this.y = 0;
		this.width = 0;
		this.height = 0;
		return;
	}
    var left = Number.MAX_VALUE;
    var top = Number.MAX_VALUE;
    var right = Number.MIN_VALUE;
    var bottom = Number.MIN_VALUE;
    for(var i = 0; i < this.children.length;i++)
    {
        var child = this.children[i];
        //如果有子节点图片Attach，则大小按子节点图片大小来
        if(child.haveAttachParam())
        {
        	this.x = child.x;
        	this.y = child.y;
        	this.width = child.width;
        	this.height = child.height;
        	return;
        }
        left = (left > child.x) ? child.x : left;
        top = (top > child.y) ? child.y : top;
        right = (right < (child.width + child.x)) ? (child.width + child.x) : right
        bottom = (bottom < (child.height + child.y)) ? (child.height + child.y) : bottom;
    }
    this.x = left;
    this.y = top;
    this.width = right - left;
    this.height = bottom - top;
}

FolderNode.prototype.addSpecifiedProperty = function(content)
{
	if(this.param != null)
	{
		var paramStr = this.param.toLowerCase()
		var paramList = paramStr.split(" ");
		for(var i = 0; i < paramList.length; i++)
		{
			var param = paramList[i];
			if(param.startWith("prefab")) content += this.getJsonFormatProperty("Prefab", 1, true);
			if(param.startWith("window")) content += this.getJsonFormatProperty("Window", 1, true);
		}
	}
	return content;
}
