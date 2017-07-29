const NUMBER_REG = /[^0-9 +-\/%\*]/;

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

    this.x = left + 1;
    this.y = top;
    this.width = right - left;
    if(this.oneLine && this.orientation == "horizontal")
    {
		//unity中"wqy"字体
        //1.159为字体大小之间preferHeight的差值
        this.height = Math.ceil(this.size * 1.159);
        if(!NUMBER_REG.test(this.text)) //纯数字
        {
            var offset = 1;
            if(this.size >= 16) offset +=1; //1为误差
            this.y = this.y - offset;
        }
        this.oneLineAdjustBoundByEffect();
    }
    else
    {
        this.height = bottom - top + Math.ceil(this.size * 0.159);
        this.height = this.height * this.getLinespacing();
    }
}

TextNode.prototype.parseTextStyleRangeList = function(descriptor)
{
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
	if((content.indexOf("\n") == -1) &&
	    (content.indexOf("\r") == -1))
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
			this.color = fragment.color;//颜色叠加也会改变color
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
    this.stroke = false;
	if (descriptor.getBoolean(ST("layerFXVisible")) &&
			descriptor.getObjectValue(ST("layerEffects")).hasKey(ST("frameFX")) &&
			descriptor.getObjectValue(ST("layerEffects")).getObjectValue(ST("frameFX")).getBoolean(ST("enabled")))
    {
    	this.stroke = true;
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
	this.dropShadow = false;
	if (descriptor.getBoolean(ST("layerFXVisible")) &&
			descriptor.getObjectValue(ST("layerEffects")).hasKey(ST("dropShadow")) &&
			descriptor.getObjectValue(ST("layerEffects")).getObjectValue(ST("dropShadow")).getBoolean(ST("enabled")))
	{
		this.dropShadow = true;
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
	if (descriptor.getBoolean(ST("layerFXVisible")) &&
			descriptor.getObjectValue(ST("layerEffects")).hasKey(ST("solidFill")) &&
			descriptor.getObjectValue(ST("layerEffects")).getObjectValue(ST("solidFill")).getBoolean(ST("enabled")))
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

TextNode.prototype.addProperty = function(content)
{
    content = BaseNode.prototype.addProperty.apply(this, arguments);
	content += this.getJsonFormatProperty("Size", this.size, true);
	content += this.getJsonFormatProperty("Color", this.color, false);
	content += this.getJsonFormatProperty("Text", this.text, false);
	content += this.getJsonFormatProperty("OneLine", this.oneLine ? 1 : 0, true);
	content += this.getJsonFormatProperty("Orientation", this.orientation, false);

	if(this.stroke)
	{
		content += this.getJsonFormatProperty("StrokeSize", this.strokeSize, true);
		content += this.getJsonFormatProperty("StrokeAlpha", this.strokeAlpha, true);
		content += this.getJsonFormatProperty("StrokeColor", this.strokeColor, false);
	}

	if(this.dropShadow)
	{
		content += this.getJsonFormatProperty("DropShadowAlpha", this.dropShadowAlpha, true);
		content += this.getJsonFormatProperty("DropShadowAngle", this.dropShadowAngle, true);
		content += this.getJsonFormatProperty("DropShadowDistance", this.dropShadowDistance, true);
		content += this.getJsonFormatProperty("DropShadowColor", this.dropShadowColor, false);
	}
	return content;
}

TextNode.prototype.oneLineAdjustBoundByEffect = function()
{
    if(this.stroke)
    {
        //描边会改变字体高度，需要重新调整
        if(this.strokeSize == 1) 
        {
            this.y += 2;
        }
        else if(this.strokeSize == 2) 
        {
            this.y += 4;
        }
        else throw "暂不支持大于2的字体描边";
    }
    if(this.dropShadow)
    {
        if(this.dropShadowDistance == 1)
        {
            this.width -= 5;//不修改的话，字体居中会因为宽度而显示有问题
        }
        else throw "暂不支持大于2的字体投影";
    }
}
