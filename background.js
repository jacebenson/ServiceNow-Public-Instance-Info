/*chrome.webRequest.onHeadersReceived.addListener(function (details) {
    
    if (details.type == "main_frame") {
        
        for (var index in details.responseHeaders) {
            var header = details.responseHeaders[index];
            shouldShow = true;
            console.log(header.name + " : " + header.value);
            if(header.name == "Server" && header.value == "ServiceNow"){
                setTimeout(function(){
                    chrome.browserAction.setBadgeBackgroundColor({ color: [255, 0, 0, 255] });
                    chrome.browserAction.setBadgeText({ "text": "YES", tabId: details.tabId });
                }, 500);

                break;
            }

        }
    }
},
    { urls: ["<all_urls>"] },
    ["responseHeaders"]);
*/

// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

// Simple extension to remove 'Cookie' request header and 'Set-Cookie' response
// header.

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
    function (details) {
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
    ['blocking', 'responseHeaders', 'extraHeaders']);