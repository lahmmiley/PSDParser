function InvalidParameter()
{
    BaseParameter.apply(this, arguments);
}

defineSubClass(BaseParameter, InvalidParameter);
