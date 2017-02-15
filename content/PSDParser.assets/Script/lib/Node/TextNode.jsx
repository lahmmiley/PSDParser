function TextNode(descriptor)
{
    BaseNode.apply(this, arguments);
}
defineSubClass(BaseNode, TextNode);

TextNode.prototype.getType = function()
{
	return "text";
}
