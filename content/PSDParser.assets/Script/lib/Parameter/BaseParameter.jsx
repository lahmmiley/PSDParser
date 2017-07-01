function BaseParameter()
{
    this.name = arguments[0];
    this.paramConfig = arguments[1];
    this.content = arguments[2];
    this.node = arguments[3];
    this.parseContent();
}

BaseParameter.prototype.parseContent = function()
{
    var parseConfig = this.paramConfig.parseConfig;
    var parseWay = parseConfig.parseWay
    switch(parseWay)
    {
        case ParameterParseWay.noValue:
            this.value = parseConfig.defaultValue;
            break;
        case ParameterParseWay.haveValue:
            this.value = this.content.substring(this.name.length, this.content.length);
            break;
        case ParameterParseWay.haveDefaultValue:
            this.value = this.content.substring(this.name.length, this.content.length);
            if(this.value == String.empty) { this.value = parseConfig.defaultValue; }
            break;
        default:
            alert(this.node.getFullPath() + "    忘记配置参数解析格式");
            break;
    }
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
    return this.paramConfig.valueIsNumber();
}

BaseParameter.prototype.verify = function()
{
    var result = String.empty;
    result += this.verifySupporType();
    result += this.verifyValueIsNumber();
    return result;
}

BaseParameter.prototype.verifySupporType = function()
{
    var result = String.empty;
    var supporTypeList = this.paramConfig.supporTypeList;
    if(supporTypeList != null)
    {
        var inSupporTypeList = false;
        for(index in supporTypeList)
        {
            if(this.node.type == supporTypeList[index])
            {
                inSupporTypeList = true;
                break;
            }
        }
        if(!inSupporTypeList)
        {
            result += this.generateErrorMsg("只能在{0}类型后面添加{1}参数".format(this.getSupporTypeStr(), this.name));
        }
    }
    return result;
}

BaseParameter.prototype.verifyValueIsNumber = function()
{
    var result = String.empty;
    if(this.paramConfig.valueIsNumber() && !this.isNumber(this.value))
    {
        result += this.generateErrorMsg("参数:{0} 不是数字".format(this.value));
    }
    return result;
}

BaseParameter.prototype.getSupporTypeStr = function()
{
    var result = String.empty;
    var supporTypeList = this.paramConfig.supporTypeList;
    for(index in supporTypeList)
    {
        result += supporTypeList[index] + " ";
    }
    result = result.substring(0, result.length - 1);
    return result;
}

BaseParameter.prototype.generateErrorMsg = function(errorMsg)
{
    return "路径:{0}\n{1}参数错误 {2}\n".format(this.node.getFullPath(), this.name, errorMsg);
}

BaseParameter.prototype.isNumber = function(str)
{
    var reg = /^[0-9]+\.?[0-9]*$/;
    if(reg.test(str))
    {
        return true;
    }
    return false;
}
