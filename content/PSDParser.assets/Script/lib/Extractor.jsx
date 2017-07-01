const ST = stringIDToTypeID;
const TS = typeIDToStringID;

function Extractor(env) 
{
    this.env = env;
}

Extractor.prototype.extract = function()
{
    var layerCount = this.getLayerCount();
    var root = new FolderNode(null, null);
    var currentNode = root;
    for(var i = layerCount; i > 0; i--)
    {
        var descriptor = this.getLayerActionDescriptor(i);
        var layerSection = this.getLayerSection(descriptor);
		if(this.notExport(descriptor, layerSection) || 
			!this.isFolderVisible(descriptor, layerSection))
		{
			i = this.findSectionEndIndex(i);
			continue;
		}
		if(!this.isContentVisible(descriptor, layerSection))
		{
			continue;
		}

        switch(layerSection)
        {
            case "layerSectionStart":
                currentNode = this.dealLayerSectionStart(descriptor, currentNode);
                break;
            case "layerSectionContent":
                this.dealLayerSectionContent(descriptor, currentNode, i);
                break;
            case "layerSectionEnd":
                currentNode = this.dealLayerSectionEnd(currentNode);
                break;
        }
    }
	root.calculateBounds();
    return root;
}

Extractor.prototype.dealLayerSectionStart = function(descriptor, currentNode)
{
    var node = new FolderNode(descriptor, currentNode);
    currentNode.children.push(node);
    return node;
}

Extractor.prototype.dealLayerSectionContent = function(descriptor, currentNode, index)
{
    if(this.isTextLayer(descriptor))
    {
        node = new TextNode(descriptor, currentNode);
		node.parseTextStyleRangeList(descriptor);
    }
    else
    {
        node = new ImageNode(descriptor, currentNode);
		node.setFragments(descriptor, index, this.env.commonAssetMap, this.env.name);
    }
    node.calculateBounds();
    currentNode.children.push(node);
}

Extractor.prototype.dealLayerSectionEnd = function(currentNode)
{
    currentNode.calculateBounds();
    return currentNode.parent;
}

Extractor.prototype.getLayerCount = function()
{
    var ref = new ActionReference();
    ref.putEnumerated(ST("document"), ST("ordinal"), ST("targetEnum"));
    var desc = executeActionGet(ref);
    return desc.getInteger(ST("numberOfLayers"));
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

Extractor.prototype.isTextLayer = function(descriptor)
{
    return descriptor.hasKey(ST("textKey"));
}

Extractor.prototype.findSectionEndIndex = function(i)
{
	var index = i - 1;
	var sectionStartCount = 1;
	for(; index > 0; index--)
	{
		var descriptor = this.getLayerActionDescriptor(index);
		var layerSection = this.getLayerSection(descriptor);
		if(layerSection == "layerSectionStart")
		{
			sectionStartCount += 1;
		}
		else if(layerSection == "layerSectionEnd")
		{
			sectionStartCount -= 1;
		}
		if(sectionStartCount == 0)
		{
			break;
		}
	}
	return index;
}

Extractor.prototype.isFolderVisible = function(descriptor, layerSection)
{
	if(layerSection == "layerSectionStart")
	{
		return descriptor.getBoolean(ST("visible"));
	}
	return true;
}

Extractor.prototype.isContentVisible = function(descriptor, layerSection)
{
	if(layerSection == "layerSectionContent")
	{
		return descriptor.getBoolean(ST("visible"));
	}
	return true;
}

Extractor.prototype.notExport = function(descriptor, layerSection)
{
	if(layerSection == "layerSectionStart")
	{
		var layerName = descriptor.getString(ST("name"));
		return layerName.toLowerCase() == NOT_EXPORT;
	}
	return false;
}
