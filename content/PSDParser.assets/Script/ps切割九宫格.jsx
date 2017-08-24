var PRESOLUTION = 72;
app.preferences.rulerUnits = Units.PIXELS;

var sourcePath = ""
var targetPath = ""

res ="dialog { \
    text:'处理九宫格切割 By 忠毅 ver1.0.2',\
        group: Group{orientation: 'column',alignChildren:'left',\
                source:Group{ \
                    orientation: 'row', \
                    edit: StaticText{text:'请选择源文件目录'},\
                    edit: EditText {text:'', preferredSize: [300, 22]},\
                    browse: Button { text:'浏览..', preferredSize: [60, 22]} ,\
                }, \
        },\
        buttons: Group { orientation: 'row', alignment: 'right',\
            skey:StaticText {text:'[文件命名说明]'},\
            Btnok: Button { text:'确定', properties:{name:'ok'} }, \
            Btncancel: Button { text:'取消', properties:{name:'cancel'} } \
        } \
}";

win = new Window (res);
win.buttons.Btnok.active = false;

win.buttons.skey.onClick = function () {
alert("原名#类型_数值参数_数值参数..."
      + "\r\n没定义\t\t默认切九等份取四个角 abc.png"
      + "\r\n左右上下切割\t原名#lrtb_左_右_上_下 a#lrtb_10_10_10_10.png"
      + "\r\n四分之一切割\t原名#lt_左_上 b_1#lt_20_20.png"
      + "\r\n上下切割\t\t原名#tb_上_下 c123#tb_30_40.png"
      + "\r\n左右切割\t\t原名#lr_左_右 s_a_1#lr_50_60.png"
    );
}


win.buttons.Btncancel.onClick = function () {
    this.parent.parent.close();
}

win.buttons.Btnok.onClick = function () {
    sourcePath = win.group.source.edit.text;
    var folder = new Folder(sourcePath);
    var fileList = folder.getFiles()
    targetPath = sourcePath + "__result"
    var tfolder = new Folder(targetPath);
    if(!tfolder.exists) {
        tfolder.create();
    }
    for (var i = 0; i < fileList.length; i++) {
        var fileObj = fileList[i]
        if (fileObj instanceof File) {
            openFile(fileObj, targetPath)
        } else {
            openFolder(fileObj, targetPath)
        }
    }
    alert("转换完成");
    // this.parent.parent.close();
}



win.group.source.browse.onClick = function () {
    var text = win.group.source.edit.text;
    win.group.source.edit.text = ""

	var testFolder = new Folder(text);
    var filr = new File (path);
	if (!testFolder.exists) {
	    text = "目录不存在";
	}
	var selFolder = Folder.selectDialog("选择资源目录", text);
	if ( selFolder != null ) {
	    win.group.source.edit.text = selFolder.fsName;
	}
	win.buttons.Btnok.active = true;
}

win.center();
win.show();

// 解析名字参数
function execuNameRule(from_path, to_path){
    var part1 = open(File(from_path))
    var width = part1.width
    var height = part1.height
    part1.close(SaveOptions.DONOTSAVECHANGES)
    var name_args = from_path.name.split("#")
    var args = [width/3, width/3, height/3, height/3]
    if (name_args && name_args.length == 2){
        var name_args2 = name_args[1].split("_")
        if (!name_args2 || name_args2.length <= 1){
            alert(from_path.name + "#后参数不足")
        } 
        else {
            var arrMactches = name_args[1].match(/\d+/g)
            if (! arrMactches || arrMactches.length <2) {
                alert(from_path.name + "参数不足")
                return
            } 
            var cut_type = name_args2[0]
            if ( cut_type == "lrtb" ) {
                if (arrMactches.length == 4){
                    args = [parseInt(arrMactches[0]),parseInt(arrMactches[1]),parseInt(arrMactches[2]),parseInt(arrMactches[3])]
                } else { 
                    args = [parseInt(arrMactches[0]),parseInt(arrMactches[1]),parseInt(arrMactches[0]),parseInt(arrMactches[1])]
                }
                cutBylrtb(from_path, to_path, width, height, args)
            } else if ( cut_type == "lt" ) {
                args = [parseInt(arrMactches[0]),parseInt(arrMactches[1])]
                cutBylt(from_path, to_path, width, height, args)
            } else if ( cut_type == "lr" ) {
                args = [parseInt(arrMactches[0]),parseInt(arrMactches[1])]
                cutBylr(from_path, to_path, width, height, args)
            }
            else if ( cut_type == "tb" ) {
                args = [parseInt(arrMactches[0]),parseInt(arrMactches[1])]
                cutBytb(from_path, to_path, width, height, args)
            } else {
                alert(from_path.name + "未支持切割类型:"+cut_type)
            }
        } 
    } 
    else {
        // 没任何参数的，直接当作九等分切
        cutBylrtb(from_path, to_path, width, height, args)
    }
}

// 左右上下定宽切割九宫格
function cutBylrtb(from_path, to_path, width, height, args){
    var left = args[0]          //左边x轴宽度
    var right = args[1]         //右边x轴宽度
    var top = args[2]           //上边y轴宽度
    var bottom = args[3]        //下边y轴宽度
    var xylist = [
        [0, 0, left, top],
        [0, height-bottom, left, height],
        [width-right, 0, width, top],
        [width-right, height-bottom, width, height]
    ]
    // alert("x:"+width+" "+height)
    var bg = app.documents.add(left + right,  top + bottom, 72, null, NewDocumentMode.RGB, DocumentFill.TRANSPARENT)
    //新建背景文档
    var layerRef =bg.layerSets.add()
    //处理四个边角
    for (var i = 0; i <= 1; i++) { 
        for (var j = 0; j <= 1; j++){
            var part = app.open(File(from_path))
            part.changeMode(ChangeMode.RGB);
            //裁切
            // alert("1:" + xylist[i * 2 + j][0] + " 2:" + xylist[i * 2 + j][1] + " 3:"+xylist[i*2+j][2] + " 4:"+xylist[i*2+j][3])
            part.crop(xylist[i*2+j])
            //复制新文档图层
            var newLayerRef =part.activeLayer
            //移动到背景文档
            var layer = newLayerRef.duplicate(layerRef,
            ElementPlacement.PLACEATEND)
            app.activeDocument=bg
            layer.translate(i*part.width,j*part.height)
            part.close(SaveOptions.DONOTSAVECHANGES)
        }
    }
    saveToFile(bg, to_path)
    bg.close(SaveOptions.DONOTSAVECHANGES)
}

// 上下切割，左右不变
function cutBytb(from_path, to_path, width, height, args){
    var top = args[0]          //上边y轴宽度
    var bottom = args[1]         //下边y轴宽度
    var xylist = [
        [0, 0, width, top],
        [0, height-bottom, width, height],
    ]
    var bg = app.documents.add(width,  top + bottom, 72, null, NewDocumentMode.RGB, DocumentFill.TRANSPARENT)
    var layerRef =bg.layerSets.add()
    for (var j = 0; j <= 1; j++){
        var part = app.open(File(from_path))
        part.changeMode(ChangeMode.RGB);
        part.crop(xylist[j])
        var newLayerRef =part.activeLayer
        var layer = newLayerRef.duplicate(layerRef,
        ElementPlacement.PLACEATEND)
        app.activeDocument=bg
        layer.translate(0,j*part.height)
        part.close(SaveOptions.DONOTSAVECHANGES)
    }
    saveToFile(bg, to_path)
    bg.close(SaveOptions.DONOTSAVECHANGES)
}

// 左右切割，上下不变
function cutBylr(from_path, to_path, width, height, args){
    var left = args[0]          //左边x轴宽度
    var right = args[1]         //右边x轴宽度
    var xylist = [
        [0, 0, left, height],
        [width-right, 0, width, height]
    ]
    var bg = app.documents.add(left + right, height, 72, null, NewDocumentMode.RGB, DocumentFill.TRANSPARENT)
    var layerRef =bg.layerSets.add()
    for (var i = 0; i <= 1; i++) { 
        var part = app.open(File(from_path))
        part.changeMode(ChangeMode.RGB);
        part.crop(xylist[i])
        var newLayerRef =part.activeLayer
        var layer = newLayerRef.duplicate(layerRef,
        ElementPlacement.PLACEATEND)
        app.activeDocument=bg
        layer.translate(i*part.width,0)
        part.close(SaveOptions.DONOTSAVECHANGES)
    }
    saveToFile(bg, to_path)
    bg.close(SaveOptions.DONOTSAVECHANGES)
}

// 四分之一切割
function cutBylt(from_path, to_path, width, height, args){
    var left = args[0]          //左边x轴宽度
    var top = args[1]        //下边y轴宽度
    var xylist = [
        [0, 0, left, top],
    ]
    var bg = app.documents.add(left,  top, 72, null, NewDocumentMode.RGB, DocumentFill.TRANSPARENT)
    var layerRef =bg.layerSets.add()
    var part = app.open(File(from_path))
    part.changeMode(ChangeMode.RGB);
    part.crop(xylist[0])
    var newLayerRef =part.activeLayer
    var layer = newLayerRef.duplicate(layerRef,
    ElementPlacement.PLACEATEND)
    app.activeDocument=bg
    layer.translate(0,0)
    part.close(SaveOptions.DONOTSAVECHANGES)
    saveToFile(bg, to_path)
    bg.close(SaveOptions.DONOTSAVECHANGES)
}

// 打开文件
function openFile(fileName, targetFolder) {
    var resName = targetFolder + "/" + fileName.name
    var reup = /PNG$/g
    var relow = /png$/g
    if (reup.test(resName)) {
        execuNameRule(fileName, resName)
    } else if (relow.test(resName)) {
        execuNameRule(fileName, resName)
    }
}

// 保存文件
function saveToFile(obj, to_path){
    var options = new ExportOptionsSaveForWeb();
    options.quality = 100;//默认质量是60
    options.format = SaveDocumentType.PNG;
    options.PNG8 = false;
    obj.changeMode(ChangeMode.RGB);
    obj.trim(TrimType.TOPLEFT, true, true, true, true)
    obj.exportDocument(File(to_path), ExportType.SAVEFORWEB, options);
}

// 遍历目录
function openFolder(folder, targetFolder) {
    var fileList = folder.getFiles()
    var targetFolder = targetFolder + "/" + folder.name
    var tfolder = new Folder(targetFolder);
    if(!tfolder.exists) {
        tfolder.create();
    }
    for (var i = 0; i < fileList.length; i++) {
        var fileObj = fileList[i]
        if (fileObj instanceof File) {
            openFile(fileObj, targetFolder)
        } else {
            openFolder(fileObj, targetFolder)
        }
    }
}
