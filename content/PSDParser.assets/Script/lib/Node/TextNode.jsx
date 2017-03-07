function TextNode(descriptor)
{
	this.type = TYPE_TEXT;
    BaseNode.apply(this, arguments);
}
defineSubClass(BaseNode, TextNode);

//对比unity数值比较偏差
//假设一开始psd的size为1 unity中的size也为1
//那么UnityFontHeightOffsetMap[8] = 1 的意思就是当psd的size为8时，unity的size为9，有1点偏差
const UnityFontHeightOffsetMap = new Object();
UnityFontHeightOffsetMap[8] = 1;
UnityFontHeightOffsetMap[12] = 1;
UnityFontHeightOffsetMap[22] = 1;
UnityFontHeightOffsetMap[31] = 1;
UnityFontHeightOffsetMap[41] = 1;
UnityFontHeightOffsetMap[50] = 1;
UnityFontHeightOffsetMap[55] = 1;

//文本图层返回的是实际像素的区域，比文本框范围略小
//游戏研发过程中需要更加具体使用的字体和字号在此基础上调整文本框范围值
//TODO
TextNode.prototype.calculateBounds = function()
{
    var descBounds = this.descriptor.getObjectValue(ST("bounds"));
    var left = descBounds.getUnitDoubleValue(ST("left"));
    var top = descBounds.getUnitDoubleValue(ST("top"));
    var right = descBounds.getUnitDoubleValue(ST("right"));
    var top = descBounds.getUnitDoubleValue(ST("top"));
    this.x = left;
    this.y = top;
	var height = this.size;
	for(var key in UnityFontHeightOffsetMap)
	{
		if(this.size >= key)
		{
			height += 1;
		}
	}
    this.width = right - left;
    this.height = height;
}

TextNode.prototype.addSpecifiedProperty = function(content)
{
	content += this.getJsonFormatProperty("Size", this.fragments[0].size, true);
	var text = String.empty;
    for(var i = 0; i < this.fragments.length; i++)
	{
		var fragment = this.fragments[i];
		text += "<color=#" + fragment.color + ">" + fragment.text + "</color>";
	}
	content += this.getJsonFormatProperty("Text", text, false);
	return content;
}

TextNode.prototype.setFragments = function(descriptor)
{
	//new PropertyGetter().writeAllProperty(descriptor);
	this.fragments = [];
    var textStyle = descriptor.getObjectValue(ST("textKey"));
    var content = textStyle.getString(ST("textKey"));
    var styleRangeList = textStyle.getList(ST("textStyleRange"));
	//如果要缩放需求，则考虑缩放系数transform
	var factor = 1;
    if(textStyle.hasKey(ST("transform")) == true)
    {
        factor = textStyle.getObjectValue(ST("transform")).getUnitDoubleValue(ST("yy"));
    }
    for(var i = 0; i < styleRangeList.count; i++)
    {
        var styleRange = styleRangeList.getObjectValue(i);
        var start = styleRange.getInteger(ST("from"));
        var end = styleRange.getInteger(ST("to"));
        var style = styleRange.getObjectValue(ST("textStyle"));
        var text = content.substring(start, end);
        var size = style.getUnitDoubleValue(ST("size"));
		//TODO
		this.size = size;
        var color = style.getObjectValue(ST("color"));
        var textColor = new SolidColor();
        textColor.rgb.red = color.getInteger(ST("red"));
        textColor.rgb.green = color.getInteger(ST("green"));
        textColor.rgb.blue = color.getInteger(ST("blue"));
        this.fragments.push({text:text, size:Math.round(size * factor), color:textColor.rgb.hexValue});
    }
}
