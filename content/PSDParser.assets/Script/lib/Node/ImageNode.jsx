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

ImageNode.prototype.addProperty = function(content)
{
    content = BaseNode.prototype.addProperty.apply(this, arguments);
	content += this.getJsonFormatProperty("BelongPsd", this.belongPsd, false);
	content += this.getJsonFormatProperty("Alpha", this.alpha, false);
	return content;
}
