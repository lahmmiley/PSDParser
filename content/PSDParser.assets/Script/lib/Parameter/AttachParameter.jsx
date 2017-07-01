function AttachParameter()
{
    BaseParameter.apply(this, arguments);
}

defineSubClass(BaseParameter, AttachParameter);
