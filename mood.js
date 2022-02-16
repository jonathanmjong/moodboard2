BING_ENDPOINT = "https://api.bing.microsoft.com/v7.0/images/search";

function runSearch() {

  try {
    var imagesResults = document.getElementById("results"); // list obtained
    while (imagesResults.firstChild) {
      imagesResults.removeChild(imagesResults.firstChild);
    }
  } catch(e) {
    console.log(e);
  }
  
  try {
    var relatedResults = document.getElementById("related"); // list obtained
    while (relatedResults.firstChild) {
      relatedResults.removeChild(relatedResults.firstChild);
    }
  } catch(e) {
    console.log(e);
  }

  let query = document.querySelector(".search .form input").value;
  console.log("query: "+query);
  let queryurl = BING_ENDPOINT + "?q=" + encodeURIComponent(query);
  let request = new XMLHttpRequest();

  try {
    request.open("GET", queryurl);
  }
  catch (e) {
      renderErrorMessage("Bad request (invalid URL)\n" + queryurl);
      return false;
  }

  // params
  request.setRequestHeader('Ocp-Apim-Subscription-Key',BING_API_KEY);
  request.setRequestHeader('Accept', 'application/json');
  request.addEventListener("load", handleBingResponse);
  // https://docs.microsoft.com/en-us/azure/cognitive-services/bing-image-search/tutorial-bing-image-search-single-page-app
  request.addEventListener("error", function(){
    renderErrorMessage("Error completing request");
  })
  request.addEventListener("abort", function(){
    renderErrorMessage("fetus deletus");
  })
  request.send();

  return false;  // Keep this; it keeps the browser from sending the event
                  // further up the DOM chain. Here, we don't want to trigger
                  // the default form submission behavior.
}

//https://docs.microsoft.com/en-us/azure/cognitive-services/bing-image-search/tutorial-bing-image-search-single-page-app
function handleBingResponse() {
  const imagesArray = [];
  const relatedTerms = [];

  var json = this.responseText.trim();
  console.log("json here");
  console.log(json);
  var jsobj = {};

  // try to parse JSON results
    try {
        if (json.length) jsobj = JSON.parse(json);
    } catch(e) {
        renderErrorMessage("Invalid JSON response");
    }
    // contentUrl is the image url
    // thumbnailUrl is the thumbnail url
    // related searches --> text, send that back through the query
    if (this.status === 200) {
      var myMoodBoard = document.getElementById("myMoodBoard");
      if (json.length) {
        try {
          for (let i=0; i<10; i++){
            imagesArray.push(jsobj.value[i].thumbnailUrl);
            relatedTerms.push(jsobj.relatedSearches[i].text);
          }
          
          var imagesResults = document.getElementById("results"); // list obtained
          imagesResults.style.display = 'block';
          imagesArray.forEach(element => {
            var listItem = document.createElement("p");
            var image = document.createElement("img");
            image.setAttribute("src",element);
            listItem.appendChild(image);
            imagesResults.appendChild(listItem);
            listItem.onclick = function() {
              console.log("clicked!")
              var listMoodAdd = document.createElement("img");
              // listMoodAdd
              listMoodAdd.setAttribute("src",element);
              listMoodAdd.setAttribute("class", "imageSpacing");
              myMoodBoard.appendChild(listMoodAdd);
            }
          });

          var relatedResults = document.getElementById("related"); // list obtained
          // imagesResults.clearChildren();
          relatedTerms.forEach(element => {
            // for each image, add it as an image as a list item for now
            var listItem = document.createElement("p");
            var text = document.createTextNode(element);
            listItem.appendChild(text);
            listItem.setAttribute("class", "inlineResult");
            listItem.onclick = function() {
              console.log("clicked!")
              document.querySelector(".search .form input").value = element;
              runSearch();
            }
            relatedResults.appendChild(listItem);
          });

        } catch(e) {
          console.error(e);
        }
      } else {
          renderErrorMessage("Empty response (are you sending too many requests too quickly?)");
      }
    }

    else {
        if (this.status === 401) invalidateSubscriptionKey();
        var errors = jsobj.errors || [jsobj];
        var errmsg = [];
        errmsg.push("HTTP Status " + this.status + " " + this.statusText + "\n");
        for (var i = 0; i < errors.length; i++) {
            if (i) errmsg.push("\n");
            for (var k in errors[i]) errmsg.push(k + ": " + errors[i][k]);
        }
    }
}

function closeSeachPane() {
  window.location.hash = "";
}

document.querySelector("#exitButton").addEventListener("click", closeSeachPane);
