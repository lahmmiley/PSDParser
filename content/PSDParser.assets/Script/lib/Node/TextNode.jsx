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
	this.height = bottom - top + Math.round(PsdFontOffsetMap[this.size]);
}

TextNode.prototype.parseTextStyleRangeList = function(descriptor)
{
	//new PropertyGetter().writeAllProperty(descriptor);
	this.parseOrientation(descriptor);
	this.parseOneLine(descriptor);
	var fragments = this.getTextFragments(descriptor);
	this.parseTextFormat(fragments);
	this.parseStokeEffect(descriptor);
	this.parseDropShadowEffect(descriptor);
	this.parseSolidFillEffect(descriptor);
}

TextNode.prototype.parseOrientation = function(descriptor)
{
	var textStyle = descriptor.getObjectValue(ST("textKey"));
	this.orientation = TS(textStyle.getEnumerationValue(ST("orientation")));
}

TextNode.prototype.parseOneLine = function(descriptor)
{
	var textStyle = descriptor.getObjectValue(ST("textKey"));
    var content = textStyle.getString(ST("textKey"));
	//if((content.indexOf("\n") == -1) &&
	if (content.indexOf("\r") == -1)
	{
		this.oneLine = true;
	}
	else
	{
		this.oneLine = false;
	}
}

TextNode.prototype.getTextFragments = function(descriptor)
{
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
    return fragments;
}

TextNode.prototype.parseTextFormat = function(fragments)
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
			this.color = fragment.color;//颜色叠加也可能改变color
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

TextNode.prototype.parseStokeEffect = function(descriptor)
{
	if (descriptor.getObjectValue(ST("layerEffects")).hasKey(ST("frameFX"))
			&& descriptor.getObjectValue(ST("layerEffects")).getObjectValue(ST("frameFX")).getBoolean(ST("enabled")))
    {
	    var stroke = descriptor.getObjectValue(ST("layerEffects")).getObjectValue(ST("frameFX"));
	    this.strokeSize = stroke.getUnitDoubleValue(ST("size"));
	    this.strokeAlpha = stroke.getUnitDoubleValue(ST("opacity"));
	    var strokeColor = stroke.getObjectValue(ST("color"));
	    var color = new SolidColor();
	    color.rgb.red = strokeColor.getInteger(ST("red"));
	    color.rgb.green = strokeColor.getInteger(ST("green"));
	    color.rgb.blue = strokeColor.getInteger(ST("blue"));
	    this.strokeColor = color.rgb.hexValue;
    }
}

TextNode.prototype.parseDropShadowEffect = function(descriptor)
{
	if (descriptor.getObjectValue(ST("layerEffects")).hasKey(ST("dropShadow"))
			&& descriptor.getObjectValue(ST("layerEffects")).getObjectValue(ST("dropShadow")).getBoolean(ST("enabled")))
	{
	    var dropShadow = descriptor.getObjectValue(ST("layerEffects")).getObjectValue(ST("dropShadow"));
	    this.dropShadowAlpha = dropShadow.getUnitDoubleValue(ST("opacity"));
	    this.dropShadowAngle = dropShadow.getInteger(ST("localLightingAngle"));
	    this.dropShadowDistance = dropShadow.getInteger(ST("distance"));
	    var dropShadowColor = dropShadow.getObjectValue(ST("color"));
	    var color = new SolidColor();
	    color.rgb.red = dropShadowColor.getInteger(ST("red"));
	    color.rgb.green = dropShadowColor.getInteger(ST("green"));
	    color.rgb.blue = dropShadowColor.getInteger(ST("blue"));
	    this.dropShadowColor = color.rgb.hexValue;
	}
}

TextNode.prototype.parseSolidFillEffect = function(descriptor)
{
	if (descriptor.getObjectValue(ST("layerEffects")).hasKey(ST("solidFill"))
			&& descriptor.getObjectValue(ST("layerEffects")).getObjectValue(ST("solidFill")).getBoolean(ST("enabled")))
	{
    	var solidFill = descriptor.getObjectValue(ST("layerEffects")).getObjectValue(ST("solidFill"));
	    var solidFillColor = solidFill.getObjectValue(ST("color"));
	    var color = new SolidColor();
	    color.rgb.red = solidFillColor.getInteger(ST("red"));
	    color.rgb.green = solidFillColor.getInteger(ST("green"));
	    color.rgb.blue = solidFillColor.getInteger(ST("blue"));
	    this.color = color.rgb.hexValue;
	}
}

TextNode.prototype.addSpecifiedProperty = function(content)
{
	content += this.getJsonFormatProperty("Size", this.size, true);
	content += this.getJsonFormatProperty("Color", this.color, false);
	content += this.getJsonFormatProperty("Text", this.text, false);
	content += this.getJsonFormatProperty("OneLine", this.oneLine ? 1 : 0, true);
	content += this.getJsonFormatProperty("Orientation", this.orientation, false);

	if(this.strokeSize != null)
	{
		content += this.getJsonFormatProperty("StrokeSize", this.strokeSize, true);
		content += this.getJsonFormatProperty("StrokeAlpha", this.strokeAlpha, true);
		content += this.getJsonFormatProperty("StrokeColor", this.strokeColor, false);
	}

	if(this.dropShadowAlpha != null)
	{
		content += this.getJsonFormatProperty("DropShadowAlpha", this.dropShadowAlpha, true);
		content += this.getJsonFormatProperty("DropShadowAngle", this.dropShadowAngle, true);
		content += this.getJsonFormatProperty("DropShadowDistance", this.dropShadowDistance, true);
		content += this.getJsonFormatProperty("DropShadowColor", this.dropShadowColor, false);
	}

	if(this.param != null)
	{
		var paramStr = this.param.toLowerCase()
		var paramList = paramStr.split(" ");
		for(var i = 0; i < paramList.length; i++)
		{
			var param = paramList[i];
			if(param.startWith("linespacing")) content += this.getJsonFormatProperty("LineSpacing", param.substring(11, param.length), true);
			if(param.startWith("align")) content += this.getJsonFormatProperty("Align", param.substring(5, param.length), false);
		}
	}
	return content;
}
