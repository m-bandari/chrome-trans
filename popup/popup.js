chrome.tabs.executeScript({file: "/manifest.js"});
var tranId;
var procId;
chrome.runtime.onMessage.addListener((message => { //gets message from content_script, manifest.js
	tranId = message.value;
	document.getElementById("buysideid").value = tranId;
	procId = message.value2;
}))


function openXml(xslUrl,subdomain) {
	
	var xhttp = new XMLHttpRequest();			//Ajax call to get xslt_id from the views page 
	xhttp.onreadystatechange = function() {
		if(this.readyState == 4 && this.status == 200) {	
			var data = this.responseText;
			var toSearch = "edit_xslt.jsp?id=";
			var pos = data.indexOf(toSearch);
			var xslIdStr = data.substr(pos+toSearch.length,50);
			var newpos = xslIdStr.indexOf("\"");
			var xslId = xslIdStr.substr(0,newpos);	//retrieving xslt_id using string operations from the response
			var xmlUrl = "https://" + subdomain + ".bigmachines.com/admin/commerce/views/preview_xml.jsp?bs_id=" + tranId + "&xslt_id=" + xslId + "&view_type=document";
			chrome.windows.create({url:xmlUrl});			
		}
	};
	xhttp.open("GET",xslUrl,true);
	xhttp.send();
}
document.addEventListener("click",function(event) {
	if(event.target.id === "copy") {
		var copyText = document.getElementById("buysideid");
		copyText.select();
		document.execCommand("copy");
	}
	else if(event.target.id === "xml") {
		chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
		currentUrl = tabs[0].url;					//getting the current url of the active tab to retrieve the domain name
		var pos = currentUrl.search(".bigmachines.com");
		var pos1 = currentUrl.search("//");
		var subdomain = currentUrl.slice(pos1+2,pos);		
		xslUrl = "https://" + subdomain + ".bigmachines.com/admin/commerce/views/list_xslt.jsp?process_id=" + procId;
		openXml(xslUrl,subdomain);	
		});
	}
})