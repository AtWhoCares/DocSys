/*
 ** 文件内容获取接口 **
 ** 文件链接获取接口 **
 ** 文件尾缀获取与文件类型判断接口 **
 ** 对话框操作接口 **
 ** 提示对话框接口 **
 * */

var gIsPC = isPC();

function isPC() {
    var userAgentInfo = navigator.userAgent;
    var Agents = ["Android", "iPhone",
                "SymbianOS", "Windows Phone",
                "iPad", "iPod"];

    for (var v = 0; v < Agents.length; v++) {
        if (userAgentInfo.indexOf(Agents[v]) > 0) {
            return false;
        }
    }
   	return true;
}

function isWeiXin(){ 
    var ua = navigator.userAgent.toLowerCase(); 
    if(ua.indexOf('micromessenger') != -1) { 
        return true; 
    } else { 
        return false; 
    } 
}
    

//构造 buildRequestParamStrForDoc 和 getDocInfoFromRequestParamStr 需要成对使用，用于前端页面之间传递参数
//如果是传给后台的url需要用base64_urlsafe_encode
function buildRequestParamStrForDoc(docInfo)
{
	if(!docInfo)
	{
		return "";
	}
	
	var urlParamStr = "";
	var andFlag = "";
	if(docInfo.vid)
	{
		urlParamStr = "reposId=" + docInfo.vid;
		andFlag = "&";
	}

	if(docInfo.docId)
	{
		urlParamStr += andFlag + "docId=" + docInfo.docId;
		andFlag = "&";
	}
	
	if(docInfo.path)
	{
		urlParamStr += andFlag + "path=" + base64_encode(docInfo.path);
		andFlag = "&";
	}
	
	if(docInfo.name)
	{
		urlParamStr += andFlag + "name=" + base64_encode(docInfo.name);
		andFlag = "&";
	}
	
	if(docInfo.isZip)
	{
		urlParamStr += andFlag + "isZip=" + docInfo.isZip;
		andFlag = "&";		
	}

	if(docInfo.rootPath)
	{
		urlParamStr += andFlag + "rootPath=" + base64_encode(docInfo.path);
		andFlag = "&";
	}
	
	if(docInfo.rootName)
	{
		urlParamStr += andFlag + "rootName=" + base64_encode(docInfo.name);
		andFlag = "&";
	}
	
	if(docInfo.fileLink)
	{
		urlParamStr += andFlag + "fileLink=" + docInfo.fileLink;
		andFlag = "&";
	}
	return urlParamStr;
}

function getDocInfoFromRequestParamStr()
{
	var docInfo = {};

	var reposId = getQueryString("reposId");
	if(reposId && reposId != null)
	{
		docInfo.vid = reposId;
	}
	
	var docId = getQueryString("docId");
	if(docId && docId != null)
	{
		docInfo.docId = docId;
	}
	
	var path = getQueryString("path");
	if(path && path != null)
	{
		path = base64_decode(path);
	}
	else
	{
		path = "";
	}
	docInfo.path = path;

		
	var name = getQueryString("name");
	if(name && name != null)
	{
		name = base64_decode(name);
	}
	else
	{
		name = "";
	}
	docInfo.name = name;
	
	var isZip = getQueryString("isZip");
	if(isZip && isZip != null)
	{
		docInfo.isZip = isZip;
	}
	
	var rootPath = getQueryString("rootPath");
	if(rootPath && rootPath != null)
	{
		rootPath = base64_decode(rootPath);
		docInfo.rootPath = rootPath;
	}

	var rootName = getQueryString("rootName");
	if(rootName && rootName != null)
	{
		rootName = base64_decode(rootName);
		docInfo.rootName = rootName;
	}

	return docInfo;
}

//获取文件链接接口
function getDocFileLink(docInfo, successCallback, errorCallback, urlStyle)
{
	if(docInfo.isZip && docInfo.isZip == 1)
	{
		getZipDocFileLink(docInfo, successCallback, errorCallback, urlStyle);
	}
	else
	{
		getDocFileLinkBasic(docInfo, successCallback, errorCallback, urlStyle);
	}
}

function getDocFileLinkBasic(docInfo, successCallback, errorCallback, urlStyle)
{	
	var fileLink = "";
	var errorInfo = "";
	console.log("getDocFileLink()  docInfo:", docInfo);
    if(!docInfo || docInfo == null || docInfo.id == 0)
    {
    	//未定义需要显示的文件
    	errorInfo = "请选择文件";
    	errorCallback && errorCallback(errorInfo);
    	return;
    }
  	
	$.ajax({
        url : "/DocSystem/Doc/getDocFileLink.do",
        type : "post",
        dataType : "json",
        data : {
        	reposId: docInfo.vid,
            path: docInfo.path,
            name: docInfo.name,
            shareId: docInfo.shareId,
            urlStyle: urlStyle,
        },
        success : function (ret) {
        	console.log("getDocFileLink ret",ret);
        	if( "ok" == ret.status )
        	{
        		var docLink = ret.data;
        		var fileLink = buildFullLink(docLink);
        		successCallback &&successCallback(fileLink);
            }
            else 
            {
            	console.log(ret.msgInfo);
            	errorInfo = "获取文件信息失败：" + ret.msgInfo;
            	errorCallback && errorCallback(errorInfo);
            }
        },
        error : function () {
        	errorInfo = "获取文件信息失败：服务器异常";
        	errorCallback && errorCallback(errorInfo);
        }
    });
}

//获取压缩文件的文件链接接口
function getZipDocFileLink(docInfo, successCallback, errorCallback, urlStyle)
{	
	var fileLink = "";
	var errorInfo = "";
	console.log("getZipDocFileLink()  docInfo:", docInfo);
    if(!docInfo || docInfo == null || docInfo.id == 0)
    {
    	//未定义需要显示的文件
    	errorInfo = "请选择文件";
    	errorCallback && errorCallback(errorInfo);
    	return;
    }
  	
	$.ajax({
        url : "/DocSystem/Doc/getZipDocFileLink.do",
        type : "post",
        dataType : "json",
        data : {
        	reposId: docInfo.vid,
            path: docInfo.path,
            name: docInfo.name,
            isZip: docInfo.isZip,
            rootPath: docInfo.rootPath,
            rootName: docInfo.rootName,
            shareId: docInfo.shareId,
            urlStyle: urlStyle,
        },
        success : function (ret) {
        	console.log("getZipDocFileLink ret",ret);
        	if( "ok" == ret.status )
        	{
        		var docLink = ret.data;
        		var fileLink = buildFullLink(docLink);
        		successCallback &&successCallback(fileLink);
            }
            else 
            {
            	console.log(ret.msgInfo);
            	errorInfo = "获取文件信息失败：" + ret.msgInfo;
            	errorCallback && errorCallback(errorInfo);
            }
        },
        error : function () {
        	errorInfo = "获取文件信息失败：服务器异常";
        	errorCallback && errorCallback(errorInfo);
        }
    });
}

//获取文件链接接口(链接带officeEditorAuthCode)

function getDocOfficeLink(docInfo, successCallback, errorCallback, urlStyle)
{
	if(docInfo.isZip && docInfo.isZip == 1)
	{
		getZipDocOfficeLink(docInfo, successCallback, errorCallback, urlStyle);
	}
	else
	{
		getDocOfficeLinkBasic(docInfo, successCallback, errorCallback, urlStyle);
	}
}

function getDocOfficeLinkBasic(docInfo, successCallback, errorCallback, urlStyle)
{	
	var fileLink = "";
	var errorInfo = "";
	console.log("getDocOfficeLinkBasic()  docInfo:", docInfo);
    if(!docInfo || docInfo == null || docInfo.id == 0)
    {
    	//未定义需要显示的文件
    	errorInfo = "请选择文件";
    	errorCallback && errorCallback(errorInfo);
    	return;
    }
  	
	$.ajax({
        url : "/DocSystem/Doc/getDocOfficeLink.do",
        type : "post",
        dataType : "json",
        data : {
        	reposId: docInfo.vid,
            path: docInfo.path,
            name: docInfo.name,
            isZip: docInfo.isZip,
            rootPath: docInfo.rootPath,
            rootName: docInfo.rootName,
            shareId: docInfo.shareId,
            preview: "office",
            urlStyle: urlStyle,
        },
        success : function (ret) {
        	console.log("getDocOfficeLinkBasic ret",ret);
        	if( "ok" == ret.status )
        	{
        		successCallback &&successCallback(ret.data, ret.dataEx);
            }
            else 
            {
            	console.log(ret.msgInfo);
            	errorInfo = "获取文件信息失败：" + ret.msgInfo;
            	errorCallback && errorCallback(errorInfo);
            }
        },
        error : function () {
        	errorInfo = "获取文件信息失败：服务器异常";
        	errorCallback && errorCallback(errorInfo);
        }
    });
}

//获取压缩文件的文件链接接口(链接带officeEditorAuthCode)
function getZipDocOfficeLink(docInfo, successCallback, errorCallback, urlStyle)
{	
	var fileLink = "";
	var errorInfo = "";
	console.log("getZipDocOfficeLink()  docInfo:", docInfo);
    if(!docInfo || docInfo == null || docInfo.id == 0)
    {
    	//未定义需要显示的文件
    	errorInfo = "请选择文件";
    	errorCallback && errorCallback(errorInfo);
    	return;
    }
  	
	$.ajax({
        url : "/DocSystem/Doc/getZipDocOfficeLink.do",
        type : "post",
        dataType : "json",
        data : {
        	reposId: docInfo.vid,
            path: docInfo.path,
            name: docInfo.name,
            isZip: docInfo.isZip,
            rootPath: docInfo.rootPath,
            rootName: docInfo.rootName,
            shareId: docInfo.shareId,
            preview: "office",
            urlStyle: urlStyle,
        },
        success : function (ret) {
        	console.log("getZipDocOfficeLink ret",ret);
        	if( "ok" == ret.status )
        	{
        		successCallback &&successCallback(ret.data, ret.dataEx);
            }
            else 
            {
            	console.log(ret.msgInfo);
            	errorInfo = "获取文件信息失败：" + ret.msgInfo;
            	errorCallback && errorCallback(errorInfo);
            }
        },
        error : function () {
        	errorInfo = "获取文件信息失败：服务器异常";
        	errorCallback && errorCallback(errorInfo);
        }
    });
}

//文件文本内容获取接口
function getDocText(docInfo, successCallback, errorCallback)
{
	if(docInfo.isZip && docInfo.isZip == 1)
	{
		getZipDocText(docInfo, successCallback, errorCallback);
	}
	else
	{
		getDocTextBasic(docInfo, successCallback, errorCallback)
	}	
}

function getDocTextBasic(docInfo, successCallback, errorCallback)
{
	var docText = "";
	var tmpSavedDocText = "";
	var errorInfo = "";
	console.log("getDocText()  docInfo:", docInfo);
    if(!docInfo || docInfo == null || docInfo.id == 0)
    {
    	//未定义需要显示的文件
    	errorInfo = "请选择文件";
    	errorCallback && errorCallback(errorInfo);
    	//showErrorMessage("请选择文件");
    	return;
    }
      	
    $.ajax({
           url : "/DocSystem/Doc/getDocContent.do",
           type : "post",
           dataType : "text",
           data : {
            	reposId: docInfo.vid,
                docId : docInfo.id,
                pid: docInfo.pid,
                path: docInfo.path,
                name: docInfo.name,
                docType: 1, //取回文件内容
                shareId: docInfo.shareId,
            },
            success : function (ret1) {
            	//console.log("getDocText ret1",ret1);
            	var status = ret1.substring(0,2);
            	if("ok" == status)
            	{
	            	docText = ret1.substring(2);
	            	//console.log("getDocText docText",docText);
	            	
	            	//Try to get tmpSavedDocContent
	            	$.ajax({
	            	           url : "/DocSystem/Doc/getTmpSavedDocContent.do",
	            	           type : "post",
	            	           dataType : "text",
	            	           data : {
	            	            	reposId: docInfo.vid,
	            	                docId : docInfo.id,
	            	                pid: docInfo.pid,
	            	                path: docInfo.path,
	            	                name: docInfo.name,
	            	                docType: 1, //取回文件内容
	            	                shareId: docInfo.shareId,
	            	            },
	            	            success : function (ret2) {
	            	            	//console.log("getDocText ret2",ret2);
	            	            	tmpSavedDocText = ret2;
	            	            	successCallback &&successCallback(docText, tmpSavedDocText);
	            	            },
	            	            error : function () {	            	            	
	            	            	successCallback &&successCallback(docText, tmpSavedDocText);

	            	            	errorInfo = "临时保存文件内容获取失败：服务器异常";
	            	            	errorCallback && errorCallback(errorInfo);
	            	                //showErrorMessage("临时保存文件内容失败：服务器异常");
	            	            }
	            	        });
            	}
            	else
            	{
            		errorInfo = "获取文件内容失败：" + ret1
            		errorCallback && errorCallback(errorInfo);
            		//showErrorMessage("获取文件内容失败：" + ret1);
            	}
            },
            error : function () {
            	errorInfo = "获取文件内容失败：服务器异常";
        		errorCallback && errorCallback(errorInfo);
                //showErrorMessage("获取文件内容失败：服务器异常");
            }
        });
}

//压缩文件中的文件文本内容获取接口
function getZipDocText(docInfo, successCallback, errorCallback)
{
	var docText = "";
	var tmpSavedDocText = "";
	var errorInfo = "";
	console.log("getZipDocText()  docInfo:", docInfo);
    if(!docInfo || docInfo == null || docInfo.id == 0)
    {
    	//未定义需要显示的文件
    	errorInfo = "请选择文件";
    	errorCallback && errorCallback(errorInfo);
    	//showErrorMessage("请选择文件");
    	return;
    }
      	
    $.ajax({
           url : "/DocSystem/Doc/getZipDocContent.do",
           type : "post",
           dataType : "text",
           data : {
            	reposId: docInfo.vid,
                docId : docInfo.id,
                pid: docInfo.pid,
                path: docInfo.path,
                name: docInfo.name,
                rootPath: docInfo.rootPath, //压缩文件的路径
                rootName: docInfo.rootName, //压缩文件名
                docType: 1, //取回文件内容
                shareId: docInfo.shareId,
            },
            success : function (ret1) {
            	//console.log("getDocText ret1",ret1);
            	var status = ret1.substring(0,2);
            	if("ok" == status)
            	{
	            	docText = ret1.substring(2);
	            	//console.log("getDocText docText",docText);
	            	successCallback &&successCallback(docText, "");
            	}
            	else
            	{
            		errorInfo = "获取文件内容失败：" + ret1
            		errorCallback && errorCallback(errorInfo);
            		//showErrorMessage("获取文件内容失败：" + ret1);
            	}
            },
            error : function () {
            	errorInfo = "获取文件内容失败：服务器异常";
        		errorCallback && errorCallback(errorInfo);
                //showErrorMessage("获取文件内容失败：服务器异常");
            }
        });
}

//文件链接获取接口
function buildFullLink(docLink)
{
	if(docLink == null)
	{
		return null;
	}
	
	var host = window.location.hostname; //域名不带端口  
 	var port = window.location.port;
 	if(port && port != "")
 	{
 		host += ":" + port;
 	}
 	
 	var url = "http://" + host + docLink;
 	console.log("buildFullLink() url:" + url);
 	return url;
}

function getDocLink(doc)
{
	var link = "/DocSystem/web/project.html?vid="+doc.vid+"&doc="+doc.docId;
	if(doc.path && doc.path != "")
	{
		link += "&path=" + base64_encode(doc.path);
	}
	if(doc.name && doc.name != "")
	{
		link += "&name=" + base64_encode(doc.name);
	}
	return link;
}

function getDocShareLink(reposId, docShare, IpAddress)
{
	var href = "/DocSystem/web/project.html?vid="+ reposId + "&shareId=" + docShare.shareId;        			
 	console.log(href);
	
 	//var host = window.location.host;	//域名带端口
 	var host = window.location.hostname; //域名不带端口       	 		
 		
 	if(host == "localhost" && IpAddress && IpAddress != "")
 	{
 		host = 	IpAddress;
 	}
 		
 	var port = window.location.port;
 	if(port && port != "")
 	{
 		host += ":" + port;
 	}
 		
 	var url = "http://"+host+href;
 	return url;
}

function getDocDownloadLink(docInfo, urlStyle)
{
	if(docInfo.fileLink)
	{
		return docInfo.fileLink;
	}
	
	var docDataEx = docInfo.dataEx;
	if(!docDataEx || docDataEx == null)	//表明不是文件，无法预览
	{
		return null;
	}
	
	var targetName = docDataEx.name;
	var targetPath = docDataEx.path;
    targetName = encodeURI(targetName);
   	targetPath = encodeURI(targetPath);
   	if(urlStyle && urlStyle == "REST")
   	{
   		return "/DocSystem/Doc/downloadDoc/"+targetPath+"/"+targetName;   		
   	}
   	
	var docLink = "/DocSystem/Doc/downloadDoc.do?targetPath=" + targetPath + "&targetName=" + targetName;
	if(docInfo.shareId)
	{
		docLink += "&shareId="+docInfo.shareId;
	}
	return docLink;
}

function getDocDownloadFullLink(docInfo, urlStyle)
{
	var docLink = getDocDownloadLink(docInfo, urlStyle);
	var url =  buildFullLink(docLink);
	return url;
}

//文件类型获取与判断接口
function getFileSuffix(name)
{
   var i = name.lastIndexOf(".")
   if( i< 0 ){
		// 默认是文本类型
		return "";
   }
   
   var suffix = name.substring(i + 1 , name.length).toLowerCase();
   return suffix;
}

function isBinary(suffix)
{
	if(!suffix || suffix == "")
	{
		return false;
	}
	
	var fileTypeMap = {
	        bin : true,
	        exe : true,
			dll : true,
			so : true,
			lib : true,
			war : true,
			jar : true,
	};
	
	var type = fileTypeMap[suffix];
	if ( undefined == type )
	{
		return false;
	}
	
	return true;
}

function isPicture(suffix)
{
	if(!suffix || suffix == "")
	{
		return false;
	}
	
	var fileTypeMap = {
	        jpg : true,
	        jpeg : true,
			png : true,
			gif : true,
			bmp : true,
			mpg : true,
	};
	
	var type = fileTypeMap[suffix];
	if ( undefined == type )
	{
		return false;
	}
	
	return true;
}

function isVideo(suffix)
{
	if(!suffix || suffix == "")
	{
		return false;
	}
	var fileTypeMap = {
			avi : true,
			mov : true,
			mpeg : true,
			mpg : true,
			mp4 : true,
			rmvb : true,
			asf : true,
			flv : true,
			ogg : true,
	};
	
	var type = fileTypeMap[suffix];
	if ( undefined == type )
	{
		return false;
	}
	
	return true;
}

function isText(suffix)
{
	if(!suffix || suffix == "")
	{
		return false;
	}
	var fileTypeMap = {
			txt : true,
			log : true,
			md : true,
			py : true,
			java : true,
			cpp : true,
			hpp : true,
			c : true,
			h : true,
			json : true,
			xml : true,
			html : true,
			sql : true,
			js : true,
			css : true,
			jsp : true,
			php : true,
			properties : true,
			conf : true,
			out : true,
			sh : true,
			bat : true,
			msg : true,
			cmake : true,
		};
	
	var type = fileTypeMap[suffix];
	if ( undefined == type )
	{
		return false;
	}
	
	return true;
}

function isZip(suffix)
{
	if(!suffix || suffix == "")
	{
		return false;
	}
	var fileTypeMap = {
			zip : true,
		};
	
	var type = fileTypeMap[suffix];
	if ( undefined == type )
	{
		return false;
	}
	
	return true;
}

function isOffice(suffix)
{
	if(!suffix || suffix == "")
	{
		return false;
	}
	var fileTypeMap = {
			doc : true,
			docx : true,
		 	ppt : true,
			pptx : true,
			xls : true,
			xlsx : true,
		};
	
	var type = fileTypeMap[suffix];
	if ( undefined == type )
	{
		return false;
	}
	
	return true;
}

function isPdf(suffix)
{
	if(!suffix || suffix == "")
	{
		return false;
	}
	var fileTypeMap = {
			pdf : true,
		};
	
	var type = fileTypeMap[suffix];
	if ( undefined == type )
	{
		return false;
	}
	
	return true;
}

function isPictureFile(fileName)
{
	var suffix = getFileSuffix(fileName);
	return isPicture(suffix);
}

function isTextFile(fileName)
{		
	var suffix = getFileSuffix(fileName);
	return isText(suffix);
}

function getDiyFileIconType(name)
{
	var fileIconTypeMap = {
	        doc		:	"word",
			docx 	:	"word",
			xls 	: 	"excel",
			xlsx 	: 	"excel",
			ppt		:	"ppt",
			pptx	:	"ppt",
			pdf 	: 	"pdf",
			jpg 	:	"picture",
	        jpeg 	: 	"picture",
			png 	: 	"picture",
	    	gif 	: 	"picture",
			mp3 	: 	"video",
			mp4 	: 	"video",
			mpg 	: 	"video",
			mkv 	: 	"video",
			rmvb 	: 	"video",
			avi 	: 	"video",
			mov 	: 	"video",
			wav 	: 	"audio",
			html 	: 	"html",
	        htm 	: 	"html",
	        txt 	: 	"txt",
			swf 	: 	"flash",
			zip 	: 	"zip",
	        rar 	: 	"zip",
	        "7z" 	: 	"zip",
			exe 	: 	"exe",
			psd 	: 	"psd",	
	};
    
    var suffix = getFileSuffix(name);
	if(suffix == "")
    {
		// 默认是文本类型
		return "";
	}
	
    var iconType = fileIconTypeMap[suffix];
	if ( undefined == iconType )
	{
		return ""
	}
	
	return iconType;
}

//这个接口是给OfficeEditor使用的
function getDocumentType(fileType)
{
	var documentTypeMap = {
	        doc		:	"text",
	        docm 	:	"text",
	        docx	:	"text",
	        dot 	:	"text",
	        dotm	:	"text",
	        dotx 	:	"text",
	        doc		:	"text",
			docx 	:	"text",	
			epub	:	"text",
			fodt 	:	"text",
			htm		:	"text",
			htmk 	:	"text",
	        mht		:	"text",
	        odt		:	"text",
	        pdf		:	"text",
			rtf 	:	"text",	
			txt 	:	"text",	
			djvu 	:	"text",	
			xps 	:	"text",	
			fodp 	: 	"presentation",
		    odp 	: 	"presentation",
		    potm	:	"presentation",
		    pot 	: 	"presentation",
		    potx 	:	"presentation",
		    pps 	: 	"presentation",
		    ppsm 	: 	"presentation",
		    ppsx 	: 	"presentation",
		    ppt 	: 	"presentation",
		    pptm 	: 	"presentation",
		    pptx 	: 	"presentation",
		    csv 	: 	"spreadsheet",
		    fods 	: 	"spreadsheet",
		    ods 	: 	"spreadsheet",
			xls 	: 	"spreadsheet",
			xlsm 	: 	"spreadsheet",
	        xlsx 	: 	"spreadsheet",
	        xlt 	: 	"spreadsheet",
			xltm 	: 	"spreadsheet",
			xltx 	: 	"spreadsheet",
	};
	
    var type = documentTypeMap[fileType];
	if ( undefined == type )
	{
		return ""
	}
	
	return type;
}

//弹出对话框操作接口
function closeBootstrapDialog(id){ 
	$("#"+id + "div").remove();	//删除全屏遮罩
	$("#"+id).remove();	//删除对话框
}

//提示对话框
function showErrorMessage($msg) {
	qiao.bs.alert($msg);
}

//提示框
function showSuccessMsg(msg)
{
    bootstrapQ.msg({
			msg : msg,
			type : 'success',
			time : 1000,
	});
}

/****************** Show File In NewPage/Dialog **************************/
function openDoc(doc, showUnknownFile, openInNewPage, preview, shareId)
{
	console.log("openDoc() showUnknownFile:" + showUnknownFile + " openInNewPage:" + openInNewPage + " preview:" + preview);
	console.log("openDoc() doc:",doc);
	
	if(doc == null || doc.type == 2)
	{
		//Folder do nothing
		return;
	}
	
	//copy do to docInfo
	var docInfo = copyDocInfo(doc, shareId);
	
	if(showUnknownFile && (showUnknownFile == true || showUnknownFile == "showUnknownFile"))
	{
		showUnknownFile = true;
	}
	else
	{
		showUnknownFile = false;
	}
	
	if(openInNewPage && (openInNewPage == true || openInNewPage == "openInNewPage"))
	{
		openInNewPage = true;
	}
	else
	{
		openInNewPage = false;
	}
	
	if(isPicture(docInfo.fileSuffix))
	{
		showImage(docInfo, openInNewPage);
	}
	else if(isVideo(docInfo.fileSuffix))
	{
		showVideo(docInfo, openInNewPage);
	}
	else if(isPdf(docInfo.fileSuffix))
	{
		docInfo.fileLink = ""; //copyDocInfo的fileLink不是RESTLink，因此需要清空，保证showPdf接口重新获取RESTLINK
		showPdf(docInfo, openInNewPage);
	}
	else if(isOffice(docInfo.fileSuffix))
	{
		openOffice(docInfo, openInNewPage, preview);
	}
	else if(isText(docInfo.fileSuffix))
	{
		showText(docInfo, openInNewPage);
	}
	else if(isZip(docInfo.fileSuffix))
	{
		showZip(docInfo, openInNewPage);
	}
	else if(isBinary(docInfo.fileSuffix))
	{
		//Do nothing	
	}
	else	//UnknownFile
	{
		if(showUnknownFile && showUnknownFile == true)
		{
			showText(docInfo, openInNewPage);
		}
	}
}

function copyDocInfo(doc, shareId)
{
	if(doc)
	{
		var docInfo = {};
    	if(doc.vid)
    	{
			docInfo.vid = doc.vid;
    	}
    	else
    	{
    		docInfo.vid = gReposInfo.id;
    	}
    	
    	if(gShareId)
    	{
    		docInfo.shareId = gShareId;
    	}
    	
		docInfo.docId = doc.docId;
		docInfo.path = doc.path;
		docInfo.name = doc.name;
		docInfo.isZip = doc.isZip;
		docInfo.rootPath = doc.rootPath;
		docInfo.rootName = doc.rootName;	
		
		if(doc.fileSuffix)
		{
			docInfo.fileSuffix = doc.fileSuffix;	
		}
		else
		{
			docInfo.fileSuffix = getFileSuffix(docInfo.name);    			
		}
		
		if(doc.dataEx)
		{
			docInfo.dataEx = doc.dataEx;
			var fileLink = getDocDownloadFullLink(docInfo);
			if(fileLink && fileLink != null)
			{
				docInfo.fileLink = fileLink;
			}
		}
		
		return docInfo;
	}
	return null;
}

function openOffice(docInfo, openInNewPage, preview)
{
    $.ajax({
        url : "/DocSystem/Doc/getDocOfficeLink.do",
        type : "post",
        dataType : "json",
        data : {
        	reposId: docInfo.vid,
            docId : docInfo.docId,
            pid: docInfo.pid,
            path: docInfo.path,
            name: docInfo.name,
            shareId: docInfo.shareId,
            preview: preview,  //preview表示是否是预览，预览则是转成pdf
        },
        success : function (ret) {
            if( "ok" == ret.status ){
            	console.log("openOffice ret", ret);
            	if(ret.dataEx == "pdf")
                {
    				docInfo.fileLink = ret.data;
    				showPdf(docInfo, openInNewPage);
                }
            	else
                {
            		if(openInNewPage == false)
            		{
            			docInfo.fileLink = ret.data;
            		}
            		showOffice(docInfo, openInNewPage);
                }
            }
            else
            {
            	console.log("previewOfficeInDialog getDocOfficeLink Failed");
            	showText(docInfo, openInNewPage); //ReadOnly 方式显示文件内容
            }
        },
        error : function () {
            //showErrorMessage("文件预览失败：服务器异常");
            console.log("previewOfficeInDialog getDocOfficeLink Failed 服务器异常");
            showText(docInfo, openInNewPage); //ReadOnly 方式显示文件内容
        }
    });
}

function showImage(docInfo, openInNewPage)
{
	if(openInNewPage)
	{
		showImgInNewPage(docInfo);
	}
	else
	{
		showImgInDialog(docInfo);
	}
}

function showVideo(docInfo, openInNewPage)
{
	if(openInNewPage)
	{
		showVideoInNewPage(docInfo);
	}
	else
	{
		showVideoInDialog(docInfo);
	}
}

function showZip(docInfo, openInNewPage)
{
	if(openInNewPage)
	{
		showZipInNewPage(docInfo);
	}
	else
	{
		showZipInDialog(docInfo);
	}
}

function showPdf(docInfo, openInNewPage)
{
	if(openInNewPage)
	{
		showPdfInNewPage(docInfo);
	}
	else
	{
		showPdfInDialog(docInfo);
	}
}

function showText(docInfo, openInNewPage)
{
	if(openInNewPage)
	{
		showTextInNewPage(docInfo);
	}
	else
	{
		showTextInDialog(docInfo);
	}
}

function showOffice(docInfo, openInNewPage)
{
	if(openInNewPage)
	{
		showOfficeInNewPage(docInfo);
	}
	else
	{
		showOfficeInDialog(docInfo);
	}
}

//ShowDocInNewPage
function showImgInNewPage(docInfo, fileLink)
{
	console.log("showImgInDialog docInfo:", docInfo);
	if(fileLink && fileLink != "")
	{
		docInfo.fileLink = fileLink;
	}
	var urlParamStr = buildRequestParamStrForDoc(docInfo);
	window.open("/DocSystem/web/image.html?" + urlParamStr);
}

function showVideoInNewPage(docInfo, fileLink){
	console.log("showVideoInNewPage docInfo:", docInfo);
	if(fileLink && fileLink != "")
	{
		docInfo.fileLink = fileLink;
	}
	var urlParamStr = buildRequestParamStrForDoc(docInfo);
	window.open("/DocSystem/web/video.html?" + urlParamStr);
}

function showZipInNewPage(docInfo)
{
	console.log("showZipInNewPage docInfo:", docInfo);
	var urlParamStr = buildRequestParamStrForDoc(docInfo);
	window.open("/DocSystem/web/zip.html?" + urlParamStr);
}

function showPdfInNewPage(docInfo, fileLink)
{
	console.log("showPdfInNewPage docInfo:", docInfo);
	if(fileLink && fileLink != "")
	{
		docInfo.fileLink = fileLink;
	}
	var urlParamStr = buildRequestParamStrForDoc(docInfo);
	window.open("/DocSystem/web/pdf.html?" + urlParamStr);
}

function showMarkdownInNewPage(docInfo)
{
	console.log("showMarkdownInNewPage docInfo:", docInfo);
	var urlParamStr = buildRequestParamStrForDoc(docInfo);
	window.open("/DocSystem/web/markdown.html?" + urlParamStr);
}

function showTextInNewPage(docInfo, openType)
{
	console.log("showTextInNewPage docInfo:", docInfo);
	var urlParamStr = buildRequestParamStrForDoc(docInfo);
	if(openType && openType == "textViewer")
	{
		window.open("/DocSystem/web/text.html?" + urlParamStr);
	}
	else
	{
		window.open("/DocSystem/web/ace.html?" + urlParamStr);			
	}
}

function showOfficeInNewPage(docInfo)
{	
	console.log("showOfficeInNewPage docInfo:", docInfo);

    var urlParamStr = buildRequestParamStrForDoc(docInfo);
    console.log("urlParamStr=" + urlParamStr);
	var link = "/DocSystem/web/office.jsp?" + urlParamStr;
    window.open(link);
}

//ShowDocInDialog
function showImgInDialog(docInfo)
{
	console.log("showImgInDialog docInfo:", docInfo);
	bootstrapQ.dialog({
		id: "ImgViewer",
		title: docInfo.name,
		url: 'imgViewer.html',
		msg: '页面正在加载，请稍等...',
		foot: false,
		big: true,
		mstyle: getDialogStyle(),
		callback: function(){
			ImgViewer.imgViewerPageInit(docInfo);
		},
	});
}

function showVideoInDialog(docInfo){
	console.log("showVideoInDialog docInfo:", docInfo);
	bootstrapQ.dialog({
		id: "VideoViewer",
		title: docInfo.name,
		url: 'videoViewer.html',
		msg: '页面正在加载，请稍等...',
		foot: false,
		big: true,
		mstyle: getDialogStyle(),
		callback: function(){
			VideoViewer.videoViewerPageInit(docInfo);
		},
	});
}

function showZipInDialog(docInfo)
	{
	bootstrapQ.dialog({
		id: "ZipViewer",
		title: docInfo.name,
		url: 'zipViewer.html',
		msg: '页面正在加载，请稍等...',
		foot: false,
		big: true,
		mstyle: "width:50%;height:95%;",
		callback: function(){
			ZipViewer.zipViewerPageInit(docInfo);
		},
	});
	}

function showPdfInDialog(docInfo)
	{
	bootstrapQ.dialog({
		id: "PdfViewer",
		title: docInfo.name,
		url: 'pdfViewer.html',
		msg: '页面正在加载，请稍等...',
		foot: false,
		big: true,
		mstyle: "width:95%;height:95%;",
		callback: function(){
			PdfViewer.pdfViewerPageInit(docInfo);
		},
	});
	}

function showMarkdownInDialog(docInfo, docText, tmpSavedDocText)
{
	console.log("showMarkdownInDialog docInfo.docId:" + docInfo.docId);
	
	bootstrapQ.dialog({
		id: "MdViewer",
		title: docInfo.name,
		url: 'mdViewer.html',
		msg: '页面正在加载，请稍等...',
		foot: false,
		big: true,
		mstyle: getDialogStyle(),
		callback: function(){
			MdViewer.mdViewerPageInit(docInfo);
		},
	});
}

function showTextInDialog(docInfo, openType)
{
	console.log("showTextInDialog docInfo.docId:" + docInfo.docId);
	if(openType && openType == "textViewer")
	{
		bootstrapQ.dialog({
			id: "textViewer",
			title: docInfo.name,
			url: 'textViewer.html',
			msg: '页面正在加载，请稍等...',
			foot: false,
			big: true,
			mstyle: getDialogStyle(),
			callback: function(){
				TextViewer.textViewerPageInit(docInfo);
			},
		});
	}
	else
	{
		bootstrapQ.dialog({
			id: "AceEditor",
			title: docInfo.name,
			url: 'aceEditor.html',
			msg: '页面正在加载，请稍等...',
			foot: false,
			big: true,
			mstyle: getDialogStyle(),
			callback: function(){
				TextEditor.textEditorPageInit(docInfo);
			},
		});
	}
}

function showOfficeInDialog(docInfo)
{
	console.log("showOfficeInDialog docInfo:", docInfo);
	bootstrapQ.dialog({
		id: "OfficeEditor",
		title: docInfo.name,
		url: 'officeEditor.jsp',
		msg: '页面正在加载，请稍等...',
		foot: false,
		big: true,
		mstyle: "width:95%;height:95%;",
		callback: function(){
			setTimeout(function (){OfficeEditor.officeEditorPageInit(docInfo)}, 2000); 
		},
	});
}

function getDialogStyle()
{
	return 'width:95%;';	
}