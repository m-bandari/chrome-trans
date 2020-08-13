var tranId;
var procId;

chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
  currentTabUrl = tabs[0].url; //getting the current url of the active tab to retrieve the domain name
  if (
    currentTabUrl.includes(".bigmachines.com/commerce/buyside/document.jsp") //Determine if the quote id using legacy or JET UI
  ) {
    chrome.tabs
      .executeScript({
        code:
          "var tid = document.getElementsByName('id')[0].value; var pid = document.getElementsByName('bm_cm_process_id')[0].value; tid + '-' + pid",
      }, (res) => {
        Ids = res[0].split("-");
        tranId = Ids[0];
        procId = Ids[1];
        document.getElementById("buysideid").value = tranId;
      });
  } else if (currentTabUrl.includes(".bigmachines.com/commerce/transaction")) {

    currentTabUrlFragmentsArr = currentTabUrl.split("/");
    tranId = currentTabUrlFragmentsArr[6];
    fetch(`https://${currentTabUrlFragmentsArr[2]}/rest/v8/commerceProcesses/${currentTabUrlFragmentsArr[5]}/documents`)
      .then(response => {
        if (!response.ok) {
          throw new Error("Fetching process documents failed.");
        }
        response.json().then(jsonData => {
          procId = jsonData.items[0].process.id;
          document.getElementById("buysideid").value = tranId;
        });
      })
      .catch(error => {
        console.error("Problem fetching Process ID: ", error);
      });
  }
});

function openXml(xslUrl, subdomain) {
  fetch(xslUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error("Fetching XSL Id failed.");
      }
      response.text().then(data => {
        var toSearch = "edit_xslt.jsp?id=";
        var pos = data.indexOf(toSearch);
        var xslIdStr = data.substr(pos + toSearch.length, 50);
        var newpos = xslIdStr.indexOf('"');
        var xslId = xslIdStr.substr(0, newpos); //retrieving xslt_id using string operations from the response
        var xmlUrl =
          "https://" +
          subdomain +
          ".bigmachines.com/admin/commerce/views/preview_xml.jsp?bs_id=" +
          tranId +
          "&xslt_id=" +
          xslId +
          "&view_type=document";
        chrome.windows.create({ url: xmlUrl });
      });
    })
    .catch(error => {
      console.error("Problem fetching XSL ID: ", error);
    });
}

document.addEventListener("click", function (event) {
  if (event.target.id === "copy") {
    var copyText = document.getElementById("buysideid");
    copyText.select();
    document.execCommand("copy");
  } else if (event.target.id === "xml") {
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
      currentUrl = tabs[0].url; //getting the current url of the active tab to retrieve the domain name
      var pos = currentUrl.search(".bigmachines.com");
      var pos1 = currentUrl.search("//");
      var subdomain = currentUrl.slice(pos1 + 2, pos);
      xslUrl =
        "https://" +
        subdomain +
        ".bigmachines.com/admin/commerce/views/list_xslt.jsp?process_id=" +
        procId;
      openXml(xslUrl, subdomain);
    });
  }
});
