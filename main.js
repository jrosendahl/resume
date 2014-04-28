'use strict';
var httpPort = 8081;
var http = require('http');
var urlParse = require('url');
var formidable = require('formidable');
var sessionTimeout = 200000;
var winston = require('winston');
var logger = winston.loggers.get('MainLog');

function Request(req) {
	var getCookies = function() {
		var ret = {};
		if(req.headers.cookie){
			for(var i in req.headers.cookie.split(';')) {
				var parts = req.headers.cookie.split(';')[i].split('=');
				ret[parts[0].trim()] = new Cookie(parts[0].trim(),(parts[1] || '').trim());
			}
		}
		return ret;
	};
	this.url = {};
	this.postDataRaw = '';
	this.routeIndex = 1;
	this.cookies = getCookies(req);
	this.responseCookies = {};
	this.setCookie = function(name,val,maxage,expires,domain,path,secure,httponly) {
		if(this.responseCookies[name]) {
			this.responseCookies[name].val = val;
			this.responseCookies[name]['Max-Age'] = (maxage || null);
			this.responseCookies[name].Expires = expires || null;
			this.responseCookies[name].Domain = (domain || null);
			this.responseCookies[name].Path = (path || null);
			this.responseCookies[name].Secure = false;
			this.responseCookies[name].HttpOnly = true;
		}
		else {
			this.responseCookies[name] = new Cookie(name,val,maxage,expires,domain,path,secure,httponly);
		}
		//console.log(this.responseCookies);
	};
	this.deleteCookie = function(name) {
		this.responseCookies[name].val = '';
		this.responseCookies[name]['Max-Age'] = 0;
	};
	this.cookieHeader = function() {
		var retCookies = [];
		for(var key in this.responseCookies) {
			retCookies.push(this.responseCookies[key].cookieString());
		}
		return retCookies;
	};
		
	function Cookie(name,val,maxage,expires,domain,path,secure,httponly) {
		this.name = name;
		this.val = val;
		this['Max-Age'] = (maxage || null);
		this.Expires = expires || null;
		this.Domain = (domain || null);
		this.Path = (path || null);
		this.Secure = secure || false;
		this.HttpOnly = httponly || true;
		this.cookieString = function(){
			var str = this.name + '=' + this.val;
			if(this['Max-Age'] !== null) {
				str = str + '; Max-Age=' +  this['Max-Age'];
			}
			if(this.Expires !== null) {
				str = str + '; Expires=' +  this.Expires;
			}
			if(this.Domain !== null) {
				str = str + '; Domain=' +  this.Domain;
			}
			if(this.Path !== null) {
				str = str + '; Path=' +  this.Path;
			}
			if(this.Secure) {
				str = str + '; Secure';
			}	
			if(this.HttpOnly) {
				str = str + '; HttpOnly';
			}
			return str;
		};
		
		
	}

}


function ErrorHandler() {
	this.errors = [];
	this.display = function() {
		var errorMsg = this.getDom();
		return errorMsg.stringifyHTML();
	};
	this.getDom = function() {
		var errorDom = require('./lib/dom');
		var div_pageErrorContainer = new errorDom.div('pageErrorContainer');
		for(var i =0; i < this.errors.length; i++) {
			var div_errorContainer = new errorDom.div('errorContainer' + i, 'errorContainer');
			
			var div_errorTitle = new errorDom.div('errorTitle' + i, 'pageErrorTitle');
			div_errorTitle.appendChild(new errorDom.textNode(this.errors[i].title));
			
			var div_errorText = new errorDom.div('errorText' + 1, 'pageErrorText');
			div_errorText.appendChild(new errorDom.textNode(this.errors[i].text));
			
			div_pageErrorContainer.appendChild(div_errorContainer);
			div_errorContainer.appendChild(div_errorTitle);
			div_errorContainer.appendChild(div_errorText);

		}
		return div_pageErrorContainer;
	};
	this.clean = function () {
		this.errors = [];
		return true;
	};
}

function Sessions() {
	
}

var sessions = new Sessions();

function Session() {
	this.id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
		return v.toString(16);
	});

	this.errorHandler = new ErrorHandler();
	this.attributes = {};
	this.timeoutHandle = null;


	this.touch = function () {
		if(this.timeoutHandle !== null) {
			clearTimeout(this.timeoutHandle);
		}
		this.timeoutHandle = setTimeout(function (sid) {
			logger.info('Session has Ended ' + sid);
			delete sessions[sid];
		}, sessionTimeout, this.id);
	};
	// I would like to find a way to make this smart enough to delete it's self;
	this.dump = function () {return this.id;};	
}



function route(request, response, session) {
	var route;
	//logger.info(request.url.pathname);
	request.pathSplit = request.url.pathname.split('/');

	var pathname = request.pathSplit[request.routeIndex];

	function start() {
		getRoute();
	}

	function getRoute() {
		//look for the correct Route
		try {
			route = require('./'+pathname);
		}
		catch (err){
			logger.info(err);
			response.writeHead(404, {"Content-Type":"text/plain; charset=utf-8"});
			response.write("404 Not found");
			response.end();
			return false;
		}
		//set current Route
		doRouteAction();
	}


	function doRouteAction() {
		route(session,request, function(err,type,result) {
			switch(type) {
			case 'html':
				returnHTML(err,result);
				break;
			case 'json': 
				json(err, result);
				break;
			case 'reroute':
				reroute(err,result);
				break;
			case 'redirect':
				redirect(err,result);
				break;
			case 'text':
				text(err, result);
				break;
			case 'binary':
				binary(err, result);
				break;
			}

		});
	}

	function returnHTML(err, html) {
		if(err) {
			logger.error(err);
			logger.error(err.stack);
			response.writeHead(500, {"Content-Type":"text/plain; charset=utf-8"});
			response.write("500 Server Error.  Sorry :(");
			response.end();
		}
		else {
			response.statusCode = 200;
			response.setHeader('Content-Type','text/html; charset=utf-8');
			response.setHeader('Cache-Control', 'no-cache');
			response.setHeader('Set-Cookie', request.cookieHeader());
			response.write(html.stringifyHTML());
			response.end();
		}
	}
	function json(err, obj) {
		if(err) {
			logger.error(err);
			logger.error(err.stack);
			response.writeHead(500, {"Content-Type":"text/plain; charset=utf-8"});
			response.write("500 Server Error.  Sorry :(");
			response.end();
		}
		else {
			response.setHeader('Content-Type','text/html; charset=utf-8');
			response.setHeader('Cache-Control', 'no-cache');
			response.setHeader('Set-Cookie', request.cookieHeader());
			response.write(JSON.stringify(obj));
			response.end();
		}
	}

	function reroute(err,newRoute) {
		if(err) {
			logger.error(err);
			logger.error(err.stack);
			response.writeHead(500, {"Content-Type":"text/plain; charset=utf-8"});
			response.write("500 Server Error.  Sorry :(");
			response.end();
		}
		else {
			request.routeIndex = 1;
			request.url.pathname = newRoute;
			route(request,response, session);
		}
	}

	function redirect(err,newURL) {
		if(err) {
			logger.error(err);
			logger.error(err.stack);
			response.writeHead(500, {"Content-Type":"text/plain; charset=utf-8"});
			response.write("500 Server Error.  Sorry :(");
			response.end();
		}
		else{
			response.statusCode = 303;
			response.setHeader('Content-Type','text/html; charset=utf-8');
			response.setHeader('Location', newURL);
			response.setHeader('Set-Cookie', request.cookieHeader());
			response.end();
		}
	}

	function text(err, file) {
		if(err) {
			response.writeHead(500, {'Content-Type': 'text/plain'});
			response.write("500 Server Error.  Sorry :(");
			logger.error(err.stack);
			response.end();
		} 
		else {
			response.statusCode = 200;
			response.setHeader('Content-Type',file.contentType);
			response.setHeader('Set-Cookie', request.cookieHeader());
			response.write(file.file);
			response.end();
		}
	}

	function binary(err, file) {
		if(err) {
			response.writeHead(500, {'Content-Type': 'text/plain'});
			response.write("500 Server Error.  Sorry :(");
			logger.error(err.stack);
			response.end();
		} 
		else {
			response.statusCode = 200;
			response.setHeader('Content-Type',file.contentType);
			response.setHeader('Set-Cookie', request.cookieHeader());
			response.write(file.file,'binary');
			response.end();
		}
	}
	start();	
}


http.createServer(function (req, res) {
	//create the request scope
	var request = new Request(req);
	//find out what controller to use
	
	//place the URL in the request Scope
	request.url = urlParse.parse(req.url, true);
	if(request.url.pathname == '/') {
		request.url.pathname = 'index.html';
	}

	if(request.cookies.sessionid && request.url.pathname == '/user/logout') {
		delete sessions[request.cookies.sessionid.val];
	} 

	console.log(request.cookies);

	if(request.cookies.sessionid && sessions[request.cookies.sessionid.val]) {
		request.session = sessions[request.cookies.sessionid.val];
		request.session.touch();
	}
	else {
		request.session = new Session();
		request.session.touch();
		sessions[request.session.id] = request.session;
		request.setCookie('sessionid', request.session.id, '','','','/');
		logger.info('new session: ' + request.session.id);
	}
	request.attributes = request.url.query;
	

	if(req.method.toLowerCase() == 'post') {
		
		var form = new formidable.IncomingForm();
		form.parse(req, function(err, fields, files) {
			for(var keys in fields) {
				//keep request .attributes in place untill migration to Params is complete
				request.attributes[keys] =  fields[keys];
			}
			request.files = files;
			route(request, res, sessions[request.session.id]);
		});
	}
	else {
		route(request, res, sessions[request.session.id]);
	}
}).listen(httpPort);