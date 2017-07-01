//打印descriptor里面的属性
//用法 new PropertyGetter().writeAllProperty(descriptor);
function PropertyGetter(env)
{
	if(PropertyGetter.unique != undefined)
	{
		return PropertyGetter.unique;
	}
	PropertyGetter.unique = this;
	this.env = env;
}

PropertyGetter.prototype.writeAllProperty = function(descriptor)
{
	var content = this.getProperty(descriptor);
	var path = this.env.dataFolderPath + "property.txt";
	new FileWriter().write(path, content);
}

PropertyGetter.prototype.getProperty = function (actionDescriptor)
{
    return _scanAD(actionDescriptor, false, 0)

    function _scanAD(ad, isAList, depth)
    {
		var content = String.empty;
		var prefix = (TAB).repeat(depth);
        var len = ad.count;
        for (var i = 0; i < len; i++)
        {
            if (isAList)
            {
				if(i == 1)
					break;
                var key = i;
            } else
            {
                var key = ad.getKey(i);
            }

            var obType = ad.getType(key).toString();
            var obValue = null;

			switch(obType)
			{
				case "DescValueType.BOOLEANTYPE":
					obValue = ad.getBoolean(key);
					break;
				case "DescValueType.STRINGTYPE":
					obValue = ad.getString(key);
					break;
				case "DescValueType.INTEGERTYPE":
					obValue = ad.getInteger(key);
					break;
				case "DescValueType.DOUBLETYPE":
					obValue = ad.getDouble(key);
					break;
				case "DescValueType.CLASSTYPE":
					obValue = ad.getClass(key);
					break;
				case "DescValueType.RAWTYPE":
					obValue = ad.getData(key);
					break;
				case "DescValueType.LARGEINTEGERTYPE":
					obValue = ad.getLargeInteger(key);
					break;
				case "DescValueType.ALIASTYPE":
					obValue = ad.getPath(key).fullName;
					break;
				case "DescValueType.UNITDOUBLE":
                    obType = typeIDToStringID(ad.getUnitDoubleType(key)),
                    obValue = ad.getUnitDoubleValue(key)
					break;
				case "DescValueType.ENUMERATEDTYPE":
                    obType = typeIDToStringID(ad.getEnumerationType(key)),
                    obValue = typeIDToStringID(ad.getEnumerationValue(key))
					break;
				case "DescValueType.OBJECTTYPE":
				case "DescValueType.LISTTYPE":
					obValue = {};
					break;
				case "DescValueType.REFERENCETYPE":
					obValue = PropertyGetter.prototype.actionReferenceToObject(ad.getReference(key));
					break;
				default:
					alert(obType);
					break;
			}

			if (isAList)
            {
                var name = key;
            } else
            {
                var name = typeIDToStringID(key);
            }
			content += prefix + "name:" + name + TAB + "type:" + obType + TAB + "value:" + obValue.toString() + "\n";

			if(obType == "DescValueType.OBJECTTYPE")
			{
                content += _scanAD(ad.getObjectValue(key), false, depth + 1);
			}
			else if(obType == "DescValueType.LISTTYPE")
			{
                content += _scanAD(ad.getList(key), true, depth + 1);
			}
        }
		return content;
    }
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
