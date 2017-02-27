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

FolderNode.prototype.setParam = function(layerName)
{
	var tokenList = layerName.split("_");
	var hasType = TypeMap.hasOwnProperty(tokenList[0].toLowerCase());
	var paramIndex = 1;
    if(hasType)
    {
        this.type = tokenList[0].toLowerCase();
		this.name = tokenList[1];
		paramIndex = 2;
    }
	else
	{
		this.type = TYPE_CONTAINER;
		this.name = tokenList[0];
	}
	if(tokenList.length == (paramIndex + 1))
	{
		this.param = tokenList[paramIndex];
	}
}
