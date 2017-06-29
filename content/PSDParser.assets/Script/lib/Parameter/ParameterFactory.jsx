//通用参数
const PARAMETER_ATTACH = "attach";
const PARAMETER_HIDE = "hide";
const PARAMETER_MASK = "mask";

//图片参数
const PARAMETER_SLICE = "slice";
const PARAMETER_PRESERVER = "preserve";

//文本参数
const PARAMETER_ALIGN = "align";
const PARAMETER_LINESPACING = "linespacing";

//按钮参数
const PARAMETER_SCALE = "scale";
const PARAMETER_COLOR_TINT = "colortint";

//ScrollRect参数
const PARAMETER_DIRECTION = "direction";

//Canvas
const PARAMETER_CANVAS = "canvas";

//布局控件
const PARAMETER_SIZE_FITTER = "sizefitter"
const PARAMETER_VERTICAL_LAYOUT = "verticallayout"
const PARAMETER_HORIZONTAL_LAYOUT = "horizontallayout"
const PARAMETER_ELEMENT = "element"

const ParameterMap = new Object();
ParameterMap[PARAMETER_ATTACH] = PARAMETER_ATTACH;
ParameterMap[PARAMETER_MASK] = PARAMETER_MASK;
ParameterMap[PARAMETER_HIDE] = PARAMETER_HIDE;
ParameterMap[PARAMETER_CANVAS] = PARAMETER_CANVAS;

ParameterMap[PARAMETER_SLICE] = PARAMETER_SLICE;
ParameterMap[PARAMETER_PRESERVER] = PARAMETER_PRESERVER;

ParameterMap[PARAMETER_ALIGN] = PARAMETER_ALIGN;
ParameterMap[PARAMETER_LINESPACING] = PARAMETER_LINESPACING;

ParameterMap[PARAMETER_SCALE] = PARAMETER_SCALE;
ParameterMap[PARAMETER_COLOR_TINT] = PARAMETER_COLOR_TINT;

ParameterMap[PARAMETER_DIRECTION] = PARAMETER_DIRECTION;

ParameterMap[PARAMETER_SIZE_FITTER] = PARAMETER_SIZE_FITTER;
ParameterMap[PARAMETER_VERTICAL_LAYOUT] = PARAMETER_VERTICAL_LAYOUT;
ParameterMap[PARAMETER_HORIZONTAL_LAYOUT] = PARAMETER_HORIZONTAL_LAYOUT;
ParameterMap[PARAMETER_ELEMENT] = PARAMETER_ELEMENT;


function ParameterFactory()
{
}

ParameterFactory.prototype.create = function(content)
{

}
