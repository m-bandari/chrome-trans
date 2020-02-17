var tranId;
var procId;

//Upon content script injection and establishing connection with popup
chrome.runtime.onConnect.addListener(p => {
  p.onMessage.addListener(message => {
    if (message.isLegacy == "true") {
      // fetching transaction ID and Process ID in case of Legacy UI
      tranId = document.getElementsByName("id")[0].value;
      procId = document.getElementsByName("bm_cm_process_id")[0].value;
      p.postMessage({ tid: tranId, pid: procId });
    } else if (message.isLegacy == "false" && message.tabUrl != "") {
      // fetching transaction ID and Process ID in case of JET UI
      var currentTabUrl = message.tabUrl;
      var currentTabUrlFragmentsArr = currentTabUrl.split("/");
      tranId = currentTabUrlFragmentsArr[currentTabUrlFragmentsArr.length - 1];
      var processMetadataUrl =
        "https://" +
        currentTabUrlFragmentsArr[2] +
        "/rest/v8/commerceProcesses/" +
        currentTabUrlFragmentsArr[5] +
        "/documents";
      fetch(processMetadataUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error("Fetching process documents failed.");
          }
          response.json().then(jsonData => {
            procId = jsonData.items[0].process.id;
          });
        })
        .catch(error => {
          console.error("Problem fetching Process ID: ", error);
        });
      p.postMessage({ tid: tranId, pid: procId });
    }
  });
});
