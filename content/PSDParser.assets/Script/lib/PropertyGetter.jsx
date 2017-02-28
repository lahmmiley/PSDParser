//用法 new PropertyGetter().writeAllProperty(descriptor);
function PropertyGetter(env)
{
	if(PropertyGetter.unique != undefined)
	{
		return PropertyGetter.unique;
	}
	this.env = env;
	PropertyGetter.unique = this;
}

PropertyGetter.prototype.writeAllProperty = function(descriptor)
{
	var object = this.actionDescriptorToObject(descriptor, true);
	var path = this.env.dataFolderPath + "property.txt";
	var content = this.getProperty(object, descriptor, false, 0);
	new FileWriter().write(path, content);
}

//TODO
//这部分代码写得不好，干嘛不直接在actionDescriptorToObject里面解析
PropertyGetter.prototype.getProperty = function(object, descriptor, isArray, depth)
{
	var result = String.empty;
	var prefix = (TAB).repeat(depth);
	for(var name in object)
	{
		if(name == "_objectType")
		{
			continue;
		}
		var key;
		var type;
		if(isArray)
		{
			if(name != "0")
			{
				break;
			}
			key = name;
			type = descriptor.getType(key);
		}
		else
		{
			key = stringIDToTypeID(name);
			type = descriptor.getType(key);
		}

		if ("DescValueType.ENUMERATEDTYPE" == type)
		{
			result += prefix + "name:" + name+ "    type:" + TS(descriptor.getEnumerationType(key)) + "    value:" + TS(descriptor.getEnumerationValue(key)) + "\n";
		}
		else if ("DescValueType.UNITDOUBLE" == type)
		{
			result += prefix + "name:" + name+ "    type:" + typeIDToStringID(descriptor.getUnitDoubleType(key)) + "    value:" + descriptor.getUnitDoubleValue(key) + "\n";
		}
		else
		{
			result += prefix + "name:" + name+ "    type:" + type + "    value:" + object[name] + "\n";
		}
        if ("DescValueType.OBJECTTYPE" == type)
		{
			result += this.getProperty(object[name], descriptor.getObjectValue(key), false, depth + 1);
		}
		else if("DescValueType.LISTTYPE" == type)
		{
			result += this.getProperty(object[name], descriptor.getList(key), true, depth + 1);
		}
	}
	return result;
}


/**
 * 把 actionDescriptor 解析为一个 Object 并返回
 * @param actionDescriptor
 * @param in_outSimple bool 为真输出便于阅读的简单对象，否则输出带属性 Type 的完整对象
 * @returns {{}} actionDescriptor 解析后的 Object
 */
PropertyGetter.prototype.actionDescriptorToObject = function (actionDescriptor, in_outSimple)
{
    var out_ob = {};
    _scanAD(actionDescriptor, out_ob, false, in_outSimple)

    function _scanAD(ad, ob, isAList, outSimple)
    {
        var len = ad.count;
        for (var i = 0; i < len; i++)
        {
            if (isAList)
            {
                var key = i;
            } else
            {
                var key = ad.getKey(i);
            }

            var obType = ad.getType(key)
            var obValue = null;

            if ("DescValueType.BOOLEANTYPE" == obType)
            {
                obValue = ad.getBoolean(key);
            }
            else if ("DescValueType.STRINGTYPE" == obType)
            {
                obValue = ad.getString(key);
            }
            else if ("DescValueType.INTEGERTYPE" == obType)
            {
                obValue = ad.getInteger(key);
            }
            else if ("DescValueType.DOUBLETYPE" == obType)
            {
                obValue = ad.getDouble(key);
            }
            else if ("DescValueType.CLASSTYPE" == obType)
            {
                obValue = ad.getClass(key);
            }
            else if ("DescValueType.RAWTYPE" == obType)
            {
                obValue = ad.getData(key);
            }
            else if ("DescValueType.LARGEINTEGERTYPE" == obType)
            {
                obValue = ad.getLargeInteger(key);
            }
            else if ("DescValueType.ALIASTYPE" == obType)
            {
                obValue = ad.getPath(key).fullName;

            }
            else if ("DescValueType.UNITDOUBLE" == obType)
            {
                obValue = {
                    doubleType: typeIDToStringID(ad.getUnitDoubleType(key)),
                    doubleValue: ad.getUnitDoubleValue(key)
                };
            }
            else if ("DescValueType.ENUMERATEDTYPE" == obType)
            {
                obValue = {
                    enumerationType: typeIDToStringID(ad.getEnumerationType(key)),
                    enumerationValue: typeIDToStringID(ad.getEnumerationValue(key))
                };
            }
            else if ("DescValueType.REFERENCETYPE" == obType)
            {
                obValue = PropertyGetter.prototype.actionReferenceToObject(ad.getReference(key));
            }
            else if ("DescValueType.OBJECTTYPE" == obType)
            {
                obValue = {}
                _scanAD(ad.getObjectValue(key), obValue, false, outSimple)
            }
            else if ("DescValueType.LISTTYPE" == obType)
            {
                if (outSimple)
                {
                    obValue = [];
                    _scanAD(ad.getList(key), obValue, true, outSimple)
                }
                else
                {
                    obValue = {};
                    _scanAD(ad.getList(key), obValue, true, outSimple)

                }
            }


            if (isAList)
            {
                var name = key;
            } else
            {
                var name = typeIDToStringID(key);
            }

            if (outSimple)
            {
                if (isAList)
                {
                    ob[key] = obValue;
                }
                else
                {
                    ob[name] = obValue;
                    if ("DescValueType.OBJECTTYPE" == obType)
                    {
                        ob[name]._objectType = typeIDToStringID(ad.getObjectType(key));
                    }
                }

            }
            else
            {
                ob[name] = {
                    value: obValue,
                    type: obType.toString()
                };
                if ("DescValueType.OBJECTTYPE" == obType)
                {
                    ob[name].objectType = typeIDToStringID(ad.getObjectType(key));
                }

            }

        }

    }
    return out_ob
}

/**
 * 把 actionReference 解析为一个简单 Object 并返回
 * @param actionReference
 * @returns {{}} actionReference 解析后的 Object
 */
PropertyGetter.prototype.actionReferenceToObject = function (actionReference)
{
    var ob = {};

    _scanAF(actionReference, ob);
    function _scanAF(actionReference, ob)
    {
        try
        {
            ob.container = {};
            var c = actionReference.getContainer();
            if (c != undefined)
            {
                _scanAF(c, ob.container);
            }

        } catch (e)
        {
        }

        try
        {
            ob.form = actionReference.getForm().toString()
        } catch (e)
        {
        }
        try
        {
            ob.desiredClass = typeIDToStringID(actionReference.getDesiredClass())
        } catch (e)
        {
        }
        try
        {
            ob.enumeratedType = typeIDToStringID(actionReference.getEnumeratedType())
        } catch (e)
        {
        }
        try
        {
            ob.enumeratedValue = typeIDToStringID(actionReference.getEnumeratedValue())
        } catch (e)
        {
        }
        try
        {
            ob.identifier = typeIDToStringID(actionReference.getIdentifier())
        } catch (e)
        {
        }
        try
        {
            ob.index = actionReference.getIndex()
        } catch (e)
        {
        }
        try
        {
            ob.offset = actionReference.getOffset()
        } catch (e)
        {
        }
        try
        {
            ob.property = typeIDToStringID(actionReference.getProperty())
        } catch (e)
        {
        }
        try
        {
            var t = actionReference.getName();
            if (t.length > 0) ob.name = t;

        } catch (e)
        {
        }

    }


    return ob;
}
