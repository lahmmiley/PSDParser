function MaskParameter()
{
    BaseParameter.apply(this, arguments);
    this.value = HAVE_PARAMETER;
}

defineSubClass(BaseParameter, MaskParameter);
