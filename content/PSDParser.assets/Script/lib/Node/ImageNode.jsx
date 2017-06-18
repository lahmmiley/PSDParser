function ImageNode()
{
	this.type = TYPE_IMAGE;
    BaseNode.apply(this, arguments);
}
defineSubClass(BaseNode, ImageNode);

ImageNode.prototype.setFragments = function(descriptor, index, commonAssetMap, currentPsdName)
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
	this.alpha = descriptor.getInteger(ST("opacity"));
}

ImageNode.prototype.addSpecifiedProperty = function(content)
{
	content += this.getJsonFormatProperty("BelongPsd", this.belongPsd, false);
	content += this.getJsonFormatProperty("Alpha", this.alpha, false);
	if(this.param != null)
	{
		var paramStr = this.param.toLowerCase()
		var paramList = paramStr.split(" ");
		for(var i = 0; i < paramList.length; i++)
		{
			var param = paramList[i];
			if(param.startWith(PARAMETER_SLICE)) content += this.getJsonFormatProperty("Slice", param.substring(PARAMETER_SLICE.length, param.length), false);
            else if(param.startWith(PARAMETER_PRESERVER)) content += this.getJsonFormatProperty("Preserver", 1, true);
		}
	}
	return content;
}
