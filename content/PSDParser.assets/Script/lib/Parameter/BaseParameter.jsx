function BaseParameter()
{
    this.name = arguments[0];
    this.content = arguments[1];
    this.node = arguments[2];
    this.value = undefined;
}

BaseParameter.prototype.getName = function()
{
    return this.name;
}

BaseParameter.prototype.getValue = function()
{
    return this.value;
}

BaseParameter.prototype.valueIsNumber = function()
{
    return true;
}
