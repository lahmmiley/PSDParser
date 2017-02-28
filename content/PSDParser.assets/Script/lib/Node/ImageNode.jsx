function ImageNode()
{
	this.type = TYPE_IMAGE;
    BaseNode.apply(this, arguments);
}
defineSubClass(BaseNode, ImageNode);
