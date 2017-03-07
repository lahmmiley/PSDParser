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
	return content;
}
