function ImageNode()
{
    BaseNode.apply(this, arguments);
}
defineSubClass(BaseNode, ImageNode);

ImageNode.prototype.getType = function()
{
	return TYPE_IMAGE;
}
