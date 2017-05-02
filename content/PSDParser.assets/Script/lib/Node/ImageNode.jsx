function ImageNode()
{
	this.type = TYPE_IMAGE;
    BaseNode.apply(this, arguments);
}
defineSubClass(BaseNode, ImageNode);

ImageNode.prototype.setFragments = function(index, commonAssetMap, currentPsdName)
{
	node.layerIndex = index;
	if(commonAssetMap[this.name] != null)
	{
		this.belongPsd = COMMON;
	}
	else
	{
		this.belongPsd = currentPsdName;
	}
}

ImageNode.prototype.addSpecifiedProperty = function(content)
{
	content += this.getJsonFormatProperty("BelongPsd", this.belongPsd, false);
	if(this.param != null)
	{
		var paramStr = this.param.toLowerCase()
		var paramList = paramStr.split(" ");
		for(var i = 0; i < paramList.length; i++)
		{
			var param = paramList[i];
			if(param.startWith("slice")) content += this.getJsonFormatProperty("Slice", param.substring(5, param.length), false);
		}
	}
	return content;
}
