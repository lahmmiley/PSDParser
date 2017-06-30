function HideParameter()
{
    BaseParameter.apply(this, arguments);
    this.value = HAVE_PARAMETER;
}

defineSubClass(BaseParameter, HideParameter);
