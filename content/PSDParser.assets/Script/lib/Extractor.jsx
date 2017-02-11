//提取psd文件的信息
const ST = stringIDToTypeID;
const TS = typeIDToStringID;

const DUMMY_TOKEN_LIST = [/\#/g, /\./g, / /g, /副本\d*/g, /拷贝\d*/g, /copy\d*/g];
const TAB = "    "

function Extractor() {}

Extractor.prototype.extract = function()
{
    var layerCount = this.getLayerCount();
    var root = new FolderNode("Container", null);
    var currentNode = root;
    for(var i = layerCount; i >= 1; i--)
    {
        var descriptor = this.getLayerActionDescriptor(i);
        var layerSection = this.getLayerSection(descriptor);
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

    return root;
}

Extractor.prototype.dealLayerSectionStart = function(descriptor, currentNode)
{
    var node = new FolderNode("Container", descriptor);
    node.parent = currentNode;
    currentNode.children.push(node);
    return node;
}

Extractor.prototype.dealLayerSectionContent = function(descriptor, currentNode, index)
{
    if(this.isTextLayer(descriptor))
    {
        node = new TextNode("text", descriptor);
    }
    else
    {
        node = new ImageNode("image", descriptor);
        node.layerIndex = index;
    }
    node.calculateBounds();
    node.parent = currentNode;
    currentNode.children.push(node);
}

Extractor.prototype.dealLayerSectionEnd = function(currentNode)
{
    currentNode.calculateBounds();
    return currentNode.parent;
}

//工具函数
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