#include "Parameter/Config/ParameterConfig.jsx";
#include "Parameter/Config/ParameterParseConfig.jsx";
#include "Parameter/BaseParameter.jsx";
#include "Parameter/AlignParameter.jsx";
#include "Parameter/AttachParameter.jsx";
#include "Parameter/CanvasParameter.jsx";
#include "Parameter/ColorTintParameter.jsx";
#include "Parameter/DirectionParameter.jsx";
#include "Parameter/ElementParameter.jsx";
#include "Parameter/HideParameter.jsx";
#include "Parameter/HorizontalLayoutParameter.jsx";
#include "Parameter/InvalidParameter.jsx";
#include "Parameter/LineSpacingParameter.jsx";
#include "Parameter/MaskParameter.jsx";
#include "Parameter/PreserverParameter.jsx";
#include "Parameter/ScaleParameter.jsx";
#include "Parameter/SizeFitterParameter.jsx";
#include "Parameter/SliceParameter.jsx";
#include "Parameter/VerticalLayoutParameter.jsx";

//无效参数
const PARAMETER_INVALID = "Invalid"

//通用参数
const PARAMETER_ATTACH = "Attach"
const PARAMETER_HIDE = "Hide"
const PARAMETER_MASK = "Mask"

//图片参数
const PARAMETER_SLICE = "Slice"
const PARAMETER_PRESERVER = "Preserve"

//文本参数
const PARAMETER_ALIGN = "Align"
const PARAMETER_LINESPACING = "Linespacing"

//按钮参数
const PARAMETER_SCALE = "Scale"
const PARAMETER_COLOR_TINT = "Colortint"

//ScrollRect参数
const PARAMETER_DIRECTION = "Direction"

//Canvas
const PARAMETER_CANVAS = "Canvas"

//布局控件
const PARAMETER_SIZE_FITTER = "SizeFitter"
const PARAMETER_VERTICAL_LAYOUT = "VerticalLayout"
const PARAMETER_HORIZONTAL_LAYOUT = "HorizontalLayout"
const PARAMETER_ELEMENT = "Element"

const ParameterMap = new Object();
ParameterMap[PARAMETER_ATTACH] = new ParameterConfig(AttachParameter, new ParameterParseConfig(ParameterParseWay.noValue), [TYPE_IMAGE, TYPE_TEXT]);
ParameterMap[PARAMETER_HIDE] = new ParameterConfig(HideParameter, new ParameterParseConfig(ParameterParseWay.noValue));
ParameterMap[PARAMETER_MASK] = new ParameterConfig(MaskParameter, new ParameterParseConfig(ParameterParseWay.noValue));

ParameterMap[PARAMETER_CANVAS] = new ParameterConfig(CanvasParameter, new ParameterParseConfig(ParameterParseWay.haveValue, true), [TYPE_CANVAS]);

ParameterMap[PARAMETER_SLICE] = new ParameterConfig(SliceParameter, new ParameterParseConfig(ParameterParseWay.haveValue, false), [TYPE_IMAGE]);
ParameterMap[PARAMETER_PRESERVER] = new ParameterConfig(PreserverParameter, new ParameterParseConfig(ParameterParseWay.noValue), [TYPE_IMAGE]);

ParameterMap[PARAMETER_ALIGN] = new ParameterConfig(AlignParameter, new ParameterParseConfig(ParameterParseWay.haveValue, false), [TYPE_TEXT]);
ParameterMap[PARAMETER_LINESPACING] = new ParameterConfig(LineSpacingParameter, new ParameterParseConfig(ParameterParseWay.haveDefaultValue, true, 1), [TYPE_TEXT]);

ParameterMap[PARAMETER_SCALE] = new ParameterConfig(ScaleParameter, new ParameterParseConfig(ParameterParseWay.haveDefaultValue, true, 1.1), [TYPE_BUTTON, TYPE_ENTER_EXIT_BUTTON, TYPE_CUSTOM_BUTTON]);
ParameterMap[PARAMETER_COLOR_TINT] = new ParameterConfig(ColorTintParameter, new ParameterParseConfig(ParameterParseWay.noValue), [TYPE_BUTTON, TYPE_ENTER_EXIT_BUTTON, TYPE_CUSTOM_BUTTON]);

ParameterMap[PARAMETER_DIRECTION] = new ParameterConfig(DirectionParameter, new ParameterParseConfig(ParameterParseWay.haveValue, false), [TYPE_SCROLL_RECT]);

ParameterMap[PARAMETER_SIZE_FITTER] = new ParameterConfig(SizeFitterParameter, new ParameterParseConfig(ParameterParseWay.noValue));
ParameterMap[PARAMETER_VERTICAL_LAYOUT] = new ParameterConfig(VerticalLayoutParameter, new ParameterParseConfig(ParameterParseWay.noValue));
ParameterMap[PARAMETER_HORIZONTAL_LAYOUT] = new ParameterConfig(HorizontalLayoutParameter, new ParameterParseConfig(ParameterParseWay.noValue));
ParameterMap[PARAMETER_ELEMENT] = new ParameterConfig(ElementParameter, new ParameterParseConfig(ParameterParseWay.noValue));

function ParameterFactory() {}

ParameterFactory.create = function(content, node)
{
    content = content.toLowerCase();
    for(var key in ParameterMap)
    {
        if(content.startWith(key.toLowerCase()))
        {
            var config = ParameterMap[key];
            return new config.createFun(key, config, content, node);
        }
    }
    return new InvalidParameter(PARAMETER_INVALID, null, content, node);
}
