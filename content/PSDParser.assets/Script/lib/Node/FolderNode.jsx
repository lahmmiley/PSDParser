function FolderNode()
{
    BaseNode.apply(this, arguments);
}
defineSubClass(BaseNode, FolderNode);

FolderNode.prototype.calculateBounds = function()
{
	if(this.children.length == 0)
	{
        this.setBounds(0, 0, 0, 0);
		return;
	}
    var left = Number.POSITIVE_INFINITY;
    var top = Number.POSITIVE_INFINITY;
    var right = Number.NEGATIVE_INFINITY;
    var bottom = Number.NEGATIVE_INFINITY;

    for(var i = 0; i < this.children.length;i++)
    {
        var child = this.children[i];
        //如果有子节点图片Attach，则大小与子节点大小相同
        if(child.haveAttachParam())
        {
            this.setBounds(child.x, child.y, child.width, child.height);
        	return;
        }
        left = (left > child.x) ? child.x : left;
        top = (top > child.y) ? child.y : top;
        right = (right < (child.width + child.x)) ? (child.width + child.x) : right
        bottom = (bottom < (child.height + child.y)) ? (child.height + child.y) : bottom;
    }
    this.setBounds(left, top, right - left, bottom - top);
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
            if(param.startWith(PARAMETER_SCALE))
            {
                var scale = param.substring(PARAMETER_SCALE.length, param.length);
                if(scale == String.empty) scale = 1.1;//默认缩放
                content += this.getJsonFormatProperty("Scale", scale, true);
            }
            else if(param.startWith(PARAMETER_COLOR_TINT)) content += this.getJsonFormatProperty("ColorTint", 1, true);
			//if(param.startWith("prefab")) content += this.getJsonFormatProperty("Prefab", 1, true);
			//if(param.startWith("window")) content += this.getJsonFormatProperty("Window", 1, true);
		}
	}
	return content;
}
