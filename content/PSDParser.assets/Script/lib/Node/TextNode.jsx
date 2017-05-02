function TextNode(descriptor)
{
	this.type = TYPE_TEXT;
    BaseNode.apply(this, arguments);
}
defineSubClass(BaseNode, TextNode);

//文本图层返回的是实际像素的区域，比文本框范围略小
//游戏研发过程中需要更加具体使用的字体和字号在此基础上调整文本框范围值
TextNode.prototype.calculateBounds = function()
{
    var descBounds = this.descriptor.getObjectValue(ST("bounds"));
    var left = descBounds.getUnitDoubleValue(ST("left"));
    var top = descBounds.getUnitDoubleValue(ST("top"));
    var right = descBounds.getUnitDoubleValue(ST("right"));
    var bottom = descBounds.getUnitDoubleValue(ST("bottom"));
    this.x = left;
    this.y = top;
    this.width = right - left;
	this.height = bottom - top;
}

TextNode.prototype.parseTextStyleRangeList = function(descriptor)
{
	//new PropertyGetter().writeAllProperty(descriptor);
    var textStyle = descriptor.getObjectValue(ST("textKey"));
    var content = textStyle.getString(ST("textKey"));
    var styleRangeList = textStyle.getList(ST("textStyleRange"));
	var factor = 1;
    if(textStyle.hasKey(ST("transform")) == true)//缩放，则考虑缩放系数transform
    {
        factor = textStyle.getObjectValue(ST("transform")).getUnitDoubleValue(ST("yy"));
    }
	var fragments = [];
	var lastIndex = -1
    for(var i = 0; i < styleRangeList.count; i++)
    {
        var styleRange = styleRangeList.getObjectValue(i);
        var start = styleRange.getInteger(ST("from"));
        if(start == lastIndex)
        {
        	continue;
        }
        lastIndex = start;
        var end = styleRange.getInteger(ST("to"));
        var style = styleRange.getObjectValue(ST("textStyle"));
        var text = content.substring(start, end).replace(/\r/g, "\\n");
        var size = style.getUnitDoubleValue(ST("size"));
        var color = style.getObjectValue(ST("color"));
        var textColor = new SolidColor();
        textColor.rgb.red = color.getInteger(ST("red"));
        textColor.rgb.green = color.getInteger(ST("green"));
        textColor.rgb.blue = color.getInteger(ST("blue"));
        fragments.push({text:text, size:Math.round(size * factor), color:textColor.rgb.hexValue});
    }
	this.oneLine = this.isOneLine(content, textStyle);
	this.orientation = TS(textStyle.getEnumerationValue(ST("orientation")));
	this.setTextFormat(fragments);
}

TextNode.prototype.setTextFormat = function(fragments)
{
	var size = 0;
	var text = String.empty;
	for(var i = 0; i < fragments.length; i++)
	{
		var fragment = fragments[i];
		if(fragment.size > size)
		{
			size = fragment.size;
		}
		if(i == 0)
		{
			this.color = fragment.color;
		}
		if((fragment.color == this.color) || (fragments.length == 1))
		{
			text += fragment.text;
		}
		else
		{
			text += "<color=#" + fragment.color + ">" + fragment.text + "</color>";
		}
	}
	this.size = size;
	this.text = text;
}

TextNode.prototype.addSpecifiedProperty = function(content)
{
	content += this.getJsonFormatProperty("Size", this.size, true);
	content += this.getJsonFormatProperty("Color", "0x" + this.color, false);
	content += this.getJsonFormatProperty("Text", this.text, false);
	content += this.getJsonFormatProperty("OneLine", this.oneLine ? 1 : 0, true);
	content += this.getJsonFormatProperty("Orientation", this.orientation, false);
	if(this.param != null)
	{
		var paramStr = this.param.toLowerCase()
		var paramList = paramStr.split(" ");
		for(var i = 0; i < paramList.length; i++)
		{
			var param = paramList[i];
			if(param.startWith("linespacing")) content += this.getJsonFormatProperty("LineSpacing", param.substring(11, param.length), true);
			//TODO leftmiddleright
		}
	}
	return content;
}

TextNode.prototype.isOneLine = function(content)
{
	//if((content.indexOf("\n") == -1) &&
	if (content.indexOf("\r") == -1)
	{
		return true;
	}
	return false;
}
