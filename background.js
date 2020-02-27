'use strict';
function isServiceNow(headers) {
    var returnBool = false;
    headers.forEach(function (header) {
        if (header.name === "Server" && header.value === "ServiceNow") {
            returnBool = true;
        }
    });
    return returnBool;
};

chrome.webRequest.onHeadersReceived.addListener(
    // callback
    function setIcon(details){
        setTimeout(function () {
            if (details.type == "main_frame") {
                var isThisServiceNow = isServiceNow(details.responseHeaders);
                if (isThisServiceNow) {
                    var url = new URL(details.url);
                    var text = "Yes";
                    var title = "This is a ServiceNow instance of an unknown version."
                    chrome.browserAction.setBadgeText({ "text": text, tabId: details.tabId });
                    chrome.browserAction.setTitle({title: title});
                    try {
                        var xhr = new XMLHttpRequest();
                        xhr.onreadystatechange = function () {
                            if (xhr.readyState == XMLHttpRequest.DONE) {
                                if(xhr.responseText.indexOf('Build name:')>=0){
                                    text = xhr.responseText.split('Build name: ')[1].split('<br/>')[0];
                                    title = "This ServiceNow instance is on " + text + ".";
                                    text = text.toString().substr(0,1);
                                }
                                //chrome.browserAction.setBadgeBackgroundColor({ color: [255, 0, 0, 255] });
                                chrome.browserAction.setBadgeText({ "text": text, tabId: details.tabId });
                                chrome.browserAction.setTitle({title: title});
                            }
                        }
                        xhr.open('GET', url.origin + '/stats.do', true);
                        xhr.send(null);
                    } catch (e) {
                    }
                }
            }
            return { responseHeaders: details.responseHeaders };
        }, 500);
    },
    // filters
    { urls: ['https://*/*', 'http://*/*'] },
    // extraInfoSpec
    ['blocking', 'responseHeaders']);