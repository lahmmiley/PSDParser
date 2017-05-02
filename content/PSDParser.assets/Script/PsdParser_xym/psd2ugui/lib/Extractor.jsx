/*****
提取Psd文件的原始信息
生成Json文件，结构为Psd文件所有图层信息组成的树形结构
包括三种节点类型：文件夹节点（folder） 图像图层（Image）和文本图层（Text）
扩展：可以根据具体项目的需求提取图像和文本图层中相关的数据
*****/

const ST = stringIDToTypeID;
const TS = typeIDToStringID;

function Extractor(doc)
{
    this.doc = doc;
}

Extractor.prototype.getDocumentLayerCount = function()
{
    var ref = new ActionReference();
    ref.putEnumerated(ST("document"), ST("ordinal"), ST("targetEnum"));
    var desc = executeActionGet(ref);
    var count = desc.getInteger(ST("numberOfLayers"));
    return count;
}

Extractor.prototype.getLayerActionDescriptor = function(layerIndex)
{
    var ref = new ActionReference();
    ref.putIndex(ST("layer"), layerIndex);
    return executeActionGet(ref);
}

Extractor.prototype.getLayerSection = function(descriptor)
{
    return TS(descriptor.getEnumerationValue(ST("layerSection")));
}

Extractor.prototype.getLayerName = function(descriptor)
{
    return descriptor.getString(ST("name"));
}

Extractor.prototype.getLayerVisibility = function(descriptor)
{
    if(descriptor.getBoolean(ST("visible")) == true)
    {
        return 1;
    }
    return 0;
}

Extractor.prototype.isTextLayer = function(descriptor)
{
    return descriptor.hasKey(ST("textKey"));
}

Extractor.prototype.getLayerAlpha = function(descriptor)
{
    return descriptor.getUnitDoubleValue(ST("opacity")) / 255;
}

Extractor.prototype.getLayerBounds = function(descriptor)
{
    //ps的坐标是以左上角作为原点
    var descBounds = descriptor.getObjectValue(ST("bounds"));
    var left = descBounds.getUnitDoubleValue(ST("left"));
    var top = descBounds.getUnitDoubleValue(ST("top"));
    var right = descBounds.getUnitDoubleValue(ST("right"));
    var bottom = descBounds.getUnitDoubleValue(ST("bottom"));
    var x = left;
    var y = top;
    var width = right - left;
    var height = bottom - top;
    return [x, y, width, height];
}

Extractor.prototype.getTextLayerFragments = function(descriptor)
{
    var fragments = [];
    var textStyle = descriptor.getObjectValue(ST("textKey"));
    var content = textStyle.getString(ST("textKey"));
    var styleRangeList = textStyle.getList(ST("textStyleRange"));
    var factor = 1;
    if(textStyle.hasKey(ST("transform")) == true)
    {
        factor = textStyle.getObjectValue(ST("transform")).getUnitDoubleValue(ST("yy"));
    }
    for(var i = 0;i < styleRangeList.count;i++)
    {
        var styleRange = styleRangeList.getObjectValue(i);
        var start = styleRange.getInteger(ST("from"));
        var end = styleRange.getInteger(ST("to"));
        var style = styleRange.getObjectValue(ST("textStyle"));
        var text = content.substring(start, end);
        var font = style.getString(ST("fontName")).replace(" ", "");
        var size = style.getUnitDoubleValue(ST("size"));
        var color = style.getObjectValue(ST("color"));
        var textColor = new SolidColor();
        textColor.rgb.red = color.getInteger(ST("red"));
        textColor.rgb.green = color.getInteger(ST("green"));
        textColor.rgb.blue = color.getInteger(ST("blue"));
        fragments.push({text:text, font:font, size:Math.round(size * factor), color:textColor.rgb.hexValue});
    }
    return fragments;
}
Extractor.prototype.getTextLayerEffects = function(descriptor)
{
    if(this.hasLayerEffects(descriptor) == false)
    {
        return [];
    }
    var effects = [];
    if(this.hasTextLayerStrokeEffect(descriptor) == true)
    {
        effects.push(this.getTextLayerStrokeEffect(descriptor));
    }
    if(this.hasTextLayerDropShadowEffect(descriptor) == true)
    {
        effects.push(this.getTextLayerDropShadowEffect(descriptor));
    }
    return effects;
}

Extractor.prototype.getImageLayerEffects = function(descriptor)
{
    if(this.hasLayerEffects(descriptor) == false)
    {
        return [];
    }
    var effects = [];
    if(this.hasImageLayerSolidFillEffect(descriptor) == true)
    {
        effects.push(this.getImageLayerSolidFillEffect(descriptor));
    }
    return effects;
}

Extractor.prototype.hasLayerEffects = function(descriptor)
{
    return descriptor.hasKey(ST("layerEffects"));
}

Extractor.prototype.hasTextLayerStrokeEffect = function(descriptor)
{
    return descriptor.getObjectValue(ST("layerEffects")).hasKey(ST("frameFX"))
                && descriptor.getObjectValue(ST("layerEffects")).getObjectValue(ST("frameFX")).getBoolean("enabled");
}

Extractor.prototype.hasTextLayerDropShadowEffect = function(descriptor)
{
    return descriptor.getObjectValue(ST("layerEffects")).hasKey(ST("dropShadow"))
                && descriptor.getObjectValue(ST("layerEffects")).getObjectValue(ST("dropShadow")).getBoolean("enabled");
}

Extractor.prototype.hasImageLayerSolidFillEffect = function(descriptor)
{
    return descriptor.getObjectValue(ST("layerEffects")).hasKey(ST("solidFill"))
                && descriptor.getObjectValue(ST("layerEffects")).getObjectValue(ST("solidFill")).getBoolean("enabled");
}

Extractor.prototype.getTextLayerStrokeEffect = function(descriptor)
{
    var stroke = descriptor.getObjectValue(ST("layerEffects")).getObjectValue(ST("frameFX"));
    var size = stroke.getUnitDoubleValue(ST("size"));
    var alpha = stroke.getUnitDoubleValue(ST("opacity"));
    var strokeColor = stroke.getObjectValue(ST("color"));
    var color = new SolidColor();
    color.rgb.red = strokeColor.getInteger(ST("red"));
    color.rgb.green = strokeColor.getInteger(ST("green"));
    color.rgb.blue = strokeColor.getInteger(ST("blue"));
    return {type:"stroke", size:size, r:color.rgb.red, g:color.rgb.green, b:color.rgb.blue, alpha:alpha};
}

Extractor.prototype.getTextLayerDropShadowEffect = function(descriptor)
{
    var dropShadow = descriptor.getObjectValue(ST("layerEffects")).getObjectValue(ST("dropShadow"));
    var alpha = dropShadow.getUnitDoubleValue(ST("opacity"));
    var angle = dropShadow.getInteger(ST("localLightingAngle"));
    var distance = dropShadow.getInteger(ST("distance"));
    var dropShadowColor = dropShadow.getObjectValue(ST("color"));
    var color = new SolidColor();
    color.rgb.red = dropShadowColor.getInteger(ST("red"));
    color.rgb.green = dropShadowColor.getInteger(ST("green"));
    color.rgb.blue = dropShadowColor.getInteger(ST("blue"));
    return {type:"dropShadow", r:color.rgb.red, g:color.rgb.green, b:color.rgb.blue, alpha:alpha, angle:angle, distance:distance};
}

Extractor.prototype.getImageLayerSolidFillEffect = function(descriptor)
{
    var fill = descriptor.getObjectValue(ST("layerEffects")).getObjectValue(ST("solidFill"));
    var alpha = fill.getUnitDoubleValue(ST("opacity"));
    var mode;
    if(fill.getEnumerationValue(ST("mode")) == ST("normal"))
    {
        mode = "normal";
    }
    else
    {
        mode = "notSupportYet";
    }
    var fillColor = fill.getObjectValue(ST("color"));
    var color = new SolidColor();
    color.rgb.red = fillColor.getInteger(ST("red"));
    color.rgb.green = fillColor.getInteger(ST("green"));
    color.rgb.blue = fillColor.getInteger(ST("blue"));
    return {type:"solidFill", mode:mode, r:color.rgb.red, g:color.rgb.green, b:color.rgb.blue, alpha:alpha};
}

Extractor.prototype.generateTextLayerData = function(descriptor, layerIndex)
{
    var bounds = this.getLayerBounds(descriptor);
    var data = {type:"text", name:this.getLayerName(descriptor), visible:this.getLayerVisibility(descriptor),
                alpha:this.getLayerAlpha(descriptor), x:bounds[0] + 2, y:bounds[1] - 1, width:bounds[2], height:bounds[3],
                fragments:this.getTextLayerFragments(descriptor), effects:this.getTextLayerEffects(descriptor), layerIndex:layerIndex};
    return data;
}

Extractor.prototype.generateImageLayerData = function(descriptor, layerIndex)
{
    var bounds = this.getLayerBounds(descriptor);
    var data = {type:"image", name:this.getLayerName(descriptor), visible:this.getLayerVisibility(descriptor),
                alpha:this.getLayerAlpha(descriptor), x:bounds[0], y:bounds[1], width:bounds[2], height:bounds[3], 
                effects:this.getImageLayerEffects(descriptor), layerIndex:layerIndex, assetName:""};
    return data;
}

Extractor.prototype.extract = function()
{
    var layerCount = this.getDocumentLayerCount(this.doc);
    var data = {type:"folder", name:this.doc.name, visible:1, layerIndex:layerCount, 
                startIndex:layerCount, endIndex:1, parent:null, children:[]};
    var current = data;
    for(var i = layerCount; i >= 1; i--)
    {
        var descriptor = this.getLayerActionDescriptor(i);
        var layerSection = this.getLayerSection(descriptor);
        var node;
        switch(layerSection)
        {
            case "layerSectionStart":
                node = {type:"folder", name:this.getLayerName(descriptor), visible:this.getLayerVisibility(descriptor), layerIndex:i, 
                        startIndex:i, endIndex:0, parent:current, children:[]};
                current.children.push(node);
                current = node;
                break;
            case "layerSectionContent":
                if(this.isTextLayer(descriptor) == true)
                {
                    node = this.generateTextLayerData(descriptor, i);
                }
                else
                {
                    node = this.generateImageLayerData(descriptor, i);
                }
                node.parent = current;
                current.children.push(node);
                break;
            case "layerSectionEnd":
                current.endIndex = i;
                current = current.parent;
                break;
        }
    }
    return data;
}

