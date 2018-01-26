chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.create({'url': chrome.extension.getURL('listen1.html')}, function(tab) {
    // Tab opened.
  });
});

function initProxy(){
    var config = {
        mode: "pac_script",
        pacScript: {
          data: "var proxy='PROXY tproxy.unblockyk.com:51201; PROXY jproxy-1.unblockyk.com:51201;'; \n" +
            "var domains={'qq.com':1,'xiami.com':1,'music.163.com/':1,'ip8.com':1} \n" + 
            "var direct='DIRECT;'; \n" + 
            "var hasOwnProperty=Object.hasOwnProperty; \n" +
            "function FindProxyForURL(url,host){ \n" +
            "   var suffix; \n" +
            "   var pos = host.lastIndexOf('.'); \n" +
            "   while(1) { \n" +
            "       suffix = host.substring(pos + 1); \n" +
            "       if (hasOwnProperty.call(domains, suffix)) { \n" +
            "           return proxy; \n" +
            "       }\n" +
            "       if (pos <= 0) {\n" +
            "           break; \n" +
            "       }\n" +
            "       pos = host.lastIndexOf('.', pos - 1); \n" +
            "   }\n" +
            "   return direct;\n"+
            "}"
        }
    };
    chrome.proxy.settings.set({
        value: config, scope: 'regular'
    },function() {});
}

initProxy();

function hack_referer_header(details) {
    var referer_value = '';
    if (details.url.indexOf("://music.163.com/") != -1) {
        referer_value = "http://music.163.com/";
    }

    if (details.url.indexOf(".xiami.com/") != -1) {
        referer_value = "http://m.xiami.com/";
    }

    if ((details.url.indexOf("y.qq.com/") != -1) || 
        (details.url.indexOf("qqmusic.qq.com/") != -1) ||
        (details.url.indexOf("music.qq.com/") != -1) ||
        (details.url.indexOf("imgcache.qq.com/") != -1)) {
        referer_value = "http://y.qq.com/";
    }

    var isRefererSet = false;
    var isOriginSet = false;
    var headers = details.requestHeaders,
        blockingResponse = {};

    for (var i = 0, l = headers.length; i < l; ++i) {
        if ((headers[i].name == 'Referer') && (referer_value != '')) {
            headers[i].value = referer_value;
            isRefererSet = true;
        }
        if ((headers[i].name == 'Origin') && (referer_value != '')) {
            headers[i].value = referer_value;
            isOriginSet = true;
        }
    }

    if ((!isRefererSet) && (referer_value != '')) {
        headers.push({
            name: "Referer",
            value: referer_value
        });
    }

    if ((!isOriginSet) && (referer_value != '')) {
        headers.push({
            name: "Origin",
            value: referer_value
        });
    }
    
    blockingResponse.requestHeaders = headers;
    return blockingResponse;
};

chrome.webRequest.onBeforeSendHeaders.addListener(hack_referer_header, {
    urls: ["*://music.163.com/*", "*://*.xiami.com/*", "*://*.qq.com/*"]
}, ['requestHeaders', 'blocking']);