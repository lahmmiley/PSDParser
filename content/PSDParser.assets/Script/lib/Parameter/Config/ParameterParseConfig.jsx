const HAVE_PARAMETER = 1;

//参数解析方式
const ParameterParseWay = new Object; 
ParameterParseWay.noValue = 1;//只有参数名 没有值
ParameterParseWay.haveValue = 2;//有参数名 有值
ParameterParseWay.haveDefaultValue = 3;//有参数名 有默认值

function ParameterParseConfig(parseWay, isNumber, defaultValue)
{
    this.parseWay = parseWay;
    this.isNumber = isNumber;
    this.defaultValue = defaultValue;
    if(parseWay == ParameterParseWay.noValue)
    {
        this.isNumber = true;
        this.defaultValue = HAVE_PARAMETER;
    }
}
