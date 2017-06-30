function BaseNode()
{
    this.descriptor = arguments[0];
    this.parent = arguments[1];
    this.children = [];
    this.layerIndex = -1;
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
    this.paramArray = [];

	//解析参数
	this.parseLayerName();
}

BaseNode.prototype.parseLayerName = function()
{
    this.setParam();
}

BaseNode.prototype.setParam = function(layerName)
{
    this.paramArray.push(1);
}
new BaseNode();