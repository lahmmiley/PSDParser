const COMMON = "Base";
const ROOT_NAME = "root";
const TAB = "    "
const NOT_EXPORT = "notexport";

const JSON_POSTFIX = ".json";
const PNG_POSTFIX = ".png";
const FAILURE = 0;
const SUCCESS = 1;

const PARAMETER_SLICE = "slice";
const PARAMETER_ALIGN = "align";
const PARAMETER_ATTACH = "attach";
const PARAMETER_LINESPACING = "linespacing";

const ParameterMap = new Object();
ParameterMap[PARAMETER_SLICE] = PARAMETER_SLICE;
ParameterMap[PARAMETER_ALIGN] = PARAMETER_ALIGN;
ParameterMap[PARAMETER_ATTACH] = PARAMETER_ATTACH;
ParameterMap[PARAMETER_LINESPACING] = PARAMETER_LINESPACING;


const AlignMap = new Object();
AlignMap["lowercenter"] = 1;
AlignMap["lowerleft"] = 1;
AlignMap["lowerright"] = 1;
AlignMap["middlecenter"] = 1;
AlignMap["middleleft"] = 1;
AlignMap["middleright"] = 1;
AlignMap["uppercenter"] = 1;
AlignMap["upperleft"] = 1;
AlignMap["upperright"] = 1;
