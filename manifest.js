var tranId = getId();
var procId = getProcId();
chrome.runtime.sendMessage({			//sending message to background script
	value: tranId, value2: procId
});

function getId() {			//To get transaction ID from the quote page
  var input = document.getElementsByName("id");
  var tranId = input[0].value;
  return tranId;
}

function getProcId() {			//To get commerce process ID from the quote page
	var input = document.getElementsByName("bm_cm_process_id");
	var procId = input[0].value;
	return procId;
}