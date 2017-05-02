#include "lib/Environment.jsx";
#include "lib/Extractor.jsx";
#include "lib/Parser.jsx";
#include "lib/JsonFileWriter.jsx";
#include "lib/XmlFileWriter.jsx";
#include "lib/ImageLayerExporter.jsx";

app.preferences.rulerUnits = Units.PIXELS;
app.preferences.typeUnits = TypeUnits.PIXELS;

var window;
var atlasCb;
var batchCb;

const PSD_NAME_REG = /.+\$.+(.psd)$/ig;

main();

function main()
{
    if(app.documents.length == 0)
    {
        alert("未找到可解析的文档！");
        return;
    }
    createGUI();
}


function createGUI()
{
    window = new Window("dialog", "PSD文件解析工具--单一文件模式");
    window.center();
    
    var optionPanel = window.add("panel", getBounds(15, 70, 360, 80), "资源设置");
    atlasCb = optionPanel.add("checkbox", getBounds(50, 20, 120, 30), "生成图集");
    batchCb = optionPanel.add("checkbox", getBounds(220, 20, 120, 30), "批量生成");    
    atlasCb.value = true;
    
    var startBtn = window.add("button", getBounds(245, 140, 80, 30), "开始");
    startBtn.onClick = onStartClick;
    
    window.show();
}

function getBounds(x, y, width, height)
{
    return [x, y, x + width, y + height];
}

function onStartClick()
{
    try
    {
        execute();
    }
    catch(e)
    {
        alert(e);
    }
    window.close();
}

function psdParser()
{
    var env = new Environment(app.activeDocument);
    if(env.psdName.indexOf("notExport") != -1)
    {
        alert("该文件设定为不导出！");
        return;
    }

    var extractData = new Extractor(app.activeDocument).extract();

    var parser = new Parser(env);
    parser.loadSharedAssetXml();
    var parseData = parser.parse(extractData);

    var jsonWriter = new JsonFileWriter(env);
    jsonWriter.writeParseResult(parseData);

    var xmlWriter = new XmlFileWriter(env);
    xmlWriter.writeAssetXml(parser.assetMap);

    if(atlasCb.value == true)
    {
        var imageLayerExporter = new ImageLayerExporter(env);
        imageLayerExporter.export(extractData);
    }
}

function execute()
{
    if(batchCb.value == true)
    {
        var psdFiles = getPsdPath();
        for(var i = 0; i < psdFiles.length; i++)
        {
            app.open(psdFiles[i]);
            psdParser()
            app.activeDocument.close ();
        }
    }
    else
    {
        psdParser();
    }

}

function getPsdPath()
{
    var folder = new Folder(String(app.activeDocument.path));
    var files = folder.getFiles();
    var result = new Array();
    for(var i = 0; i < files.length; i++)
    {
         if(files[i].name.indexOf("notExport") != -1)
        {
           continue;
        }
        if(files[i].name.match(PSD_NAME_REG))
        {
            result.push(files[i]);
        }
    }
    return result;
}
