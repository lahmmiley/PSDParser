function ImageNode()
{
	this.type = TYPE_IMAGE;
    BaseNode.apply(this, arguments);
}
defineSubClass(BaseNode, ImageNode);

ImageNode.prototype.setFragments = function(descriptor, index, env, commonAssetMap, currentPsdName)
{
	node.layerIndex = index;
	if(env.commonAssetMap[this.name] != null)
	{
		this.belongPsd = COMMON;
	}
	else if(env.batchAssetMap[this.name] != null)
	{
		this.belongPsd = env.batchName;
	}
	else
	{
		this.belongPsd = env.name;
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
