function TextNode(descriptor)
{
    BaseNode.apply(this, arguments);
}
defineSubClass(BaseNode, TextNode);

TextNode.prototype.getType = function()
{
	return TYPE_TEXT;
}

TextNode.prototype.setFragments = function(descriptor)
{
	new PropertyGetter().writeAllProperty(descriptor);
	this.fragments = [];
    var textStyle = descriptor.getObjectValue(ST("textKey"));
    var content = textStyle.getString(ST("textKey"));
	//alert(textStyle.justification)
    var styleRangeList = textStyle.getList(ST("textStyleRange"));
	//如果要缩放需求，则考虑缩放系数transform
    for(var i = 0; i < styleRangeList.count; i++)
    {
        var styleRange = styleRangeList.getObjectValue(i);
        var start = styleRange.getInteger(ST("from"));
        var end = styleRange.getInteger(ST("to"));
        var style = styleRange.getObjectValue(ST("textStyle"));
        var text = content.substring(start, end);
        var size = style.getUnitDoubleValue(ST("size"));
        var color = style.getObjectValue(ST("color"));
        var textColor = new SolidColor();
        textColor.rgb.red = color.getInteger(ST("red"));
        textColor.rgb.green = color.getInteger(ST("green"));
        textColor.rgb.blue = color.getInteger(ST("blue"));
        this.fragments.push({text:text, size:Math.round(size), color:textColor.rgb.hexValue});
    }
}
