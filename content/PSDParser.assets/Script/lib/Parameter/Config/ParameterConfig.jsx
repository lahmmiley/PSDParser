function ParameterConfig(createFun, parseConfig, supporTypeList)
{
    this.createFun = createFun;
    this.parseConfig = parseConfig;
    this.supporTypeList = supporTypeList;
}

ParameterConfig.prototype.valueIsNumber = function()
{
    return this.parseConfig.isNumber;
}
