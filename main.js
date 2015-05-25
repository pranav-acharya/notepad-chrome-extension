var ENTER_KEYCODE = 13;//enter keycode value for keyup event
var bg = chrome.extension.getBackgroundPage();
var currentTabUrl;
chrome.tabs.getSelected(function(tab){
  console.log(tab);
  currentTabUrl = tab.url;
});

window.addEventListener("unload", function() {
  bg.popupUnloaded();
}, false);


window.onload = function(){

  document.querySelector("#searchField").addEventListener("keyup",function(){
    if(event.keyCode == ENTER_KEYCODE)
      processInput(document.getElementById('searchField').value);
  });

}

function processInput(input){
  clearResult();
  var temp = input.trim().split(" ");
  temp[0] = temp[0].toLowerCase();
  if(temp.length == 1){
    if(temp[0] == "note" || temp[0] == "notepad"){
      showNotepad();
      return;
    }else if(temp[0] == "links"){
      showLinks();
      return;
    }else if(temp[0] == "settings" || temp[0] == "preferences" ){
      chrome.tabs.create({ url: "options.html" });
    }
    //provide help to user for specific command
    for(var i=0;i<commands.length;i++){
      if(commands[i].name == temp[0]){
        var outputString = "<div id='desc'>"+commands[i].description+"</div>";
        outputString += "<div id='sub_desc'>"+commands[i].sub_description+"</div>";
        outputString += "<div id='example'>"+commands[i].example+"</div>";
        output(outputString);
        break;
      }else{
        if(i == commands.length -1 ){
          output("This command wasn't found!");
        }
      }
    }
  }
  else if(temp[0] == "define"){
    var actual_input = input.replace(temp[0]+" ","");
    define(actual_input);
  }
  else if(temp[0] == "wiki"){
    var actual_input = input.replace(temp[0]+" ","");
    wiki(actual_input);
  }
  else if(input.toLowerCase().indexOf("to")>0){
    currencyConversion(input);
  }
  else{
    chat(input);
  }

}



function define(input){
  var url = "http://google-dictionary.so8848.com/meaning?word="+input;
  ajax('GET',url,'document', function(xhr){
    var a = xhr.response.getElementsByClassName('std');
    output(a,input);
  });
}

function wiki(input){
  var url = "http://en.wikipedia.org/wiki/"+input;
  ajax('GET',url,'document', function(xhr){
    var a = xhr.response.getElementsByTagName('p');
    output(a);
  });
}

function converter(input){
  if(currencyConversion){

  }else if(others){

  }
}
function currencyConversion(input){
  var amount,from,to;
  //amount = 1600; from = "INR";to="USD";
  input = input.toUpperCase();
  var temp = input.split(" ");
  var indexOfTo;
  for(var i=0;i<temp.length;i++){
    if(temp[i] == "TO"){
      indexOfTo = i; break;
    }
  }

  from = temp[i-1];
  to = temp[i+1];
  if(temp.length == 3){//no AMOUNT is specified
    amount = 1;
  }
  else if(temp[i+2]){
    amount = temp[i+2];
  }else{
    amount = temp[0];
  }
  var url = "https://www.google.com/finance/converter?a="+amount+"&from="+from+"&to="+to;
  ajax('GET',url,'document', function(xhr){
    var a = xhr.response.getElementById('currency_converter_result').getElementsByClassName('bld')[0].innerHTML;
    a = a.split(" ");
    a[0] = a[0].replace(/^0+|0+$/g, "");
    a = a.join(" ");
    a = a.replace(/^0+|0+$/g, "");
    a = a.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    amount = amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " "+ from + " = ";
    a = "<span class='amount'>"+amount+"</span><span class='converted'>"+a+"</span>";
    output(a);
  });

}

function calc(input){

}

// 1.WHEREVER U HAVE A NUMBER U CAN REPLACE IT WITH A CALCULATOR EXPRESSION
// TEXT  - CASE INSENSITIVE
// MANUAL For Command in a.length == 0
// Keywords : define, wiki, (a) to (b), (expression) (a) to (b), (expression), scratchpad, quicklinks, Quote of the DAY with greeting
// chatterbot

function chat(input){
  var query = input.split(" ").join("+");
  var url = "http://www.botlibre.com/rest/botlibre/form-chat?instance=165&message="+query;
  ajax('GET',url,'XML', function(xhr){
    console.log("done");
    var a = xhr.responseXML.getElementsByTagName('message')[0].firstChild.nodeValue;
    output(a);
  });
}


//CALCULATOR
function calc(expression){

}

//notepad
function showNotepad(){
  var textarea = document.createElement("textarea");
  textarea.innerHTML = bg.getNotepadData();
  textarea.id = "notepad";
  textarea.addEventListener("keyup",function(){
    document.getElementById('bytesUsed').innerHTML = textarea.value.length + "/8192 bytes used";
    bg.updateNotepadData(textarea.value);
  });
  document.getElementById('result').innerHTML = "";
  document.getElementById('result').appendChild(textarea);
  document.getElementById('notepad').focus();
  var caretPos = document.getElementById('notepad').value.length;
  document.getElementById('notepad').setSelectionRange(caretPos, caretPos);

  var bytesInUse = document.createElement("p");
  bytesInUse.id = "bytesUsed";
  bytesInUse.innerHTML = textarea.value.length + "/8192 bytes used";
  document.getElementById('result').appendChild(bytesInUse);
}


function showLinks(){
  //user input shall be used to add link and search for existing links
  var storedLinks = bg.getLinksData();
  var localStoredLinks = storedLinks;
  var MIN_NUMBER_OF_CHARACTERS_FOR_FILTER = 0;
  var userInput = document.createElement("input");
  var prevInput = ""
  userInput.placeholder = "Filter OR Add new link";
  userInput.id = "linksInput";
  userInput.addEventListener('keyup',function(){
    var val = userInput.value.trim().toLowerCase();
    if(val !== prevInput){
      prevInput = val;
      document.getElementById('LinkSelectList').innerHTML = "";

      for(var i=storedLinks.length - 1 ;i >= 0;i--){
        if(storedLinks[i].toLowerCase().search(val) >= 0){
          var linksOption = document.createElement("option");
          linksOption.text = storedLinks[i];
          var linkOptionImageURL = storedLinks[i].split("/")[0];
          linksOption.style.backgroundImage = "url('http://www.google.com/s2/favicons?domain="+linkOptionImageURL+"')";
          linksOption.style.backgroundRepeat = "no-repeat";
          linksOption.style.paddingTop = "2px";
          linksOption.style.paddingLeft ="20px";
          document.getElementById('LinkSelectList').appendChild(linksOption);
        }

      }
    }

  });
  var addLinkButton = document.createElement("button");
  addLinkButton.innerHTML = "+";
  addLinkButton.addEventListener('click',function(){
    bg.addLinksData(userInput.value);
    storedLinks = bg.getLinksData();
    document.getElementById('linksInput').value = "";
    renderList();
  });

  var removeLinkButton = document.createElement("button");
  removeLinkButton.innerHTML = "-";
  removeLinkButton.addEventListener('click',function(){
    bg.removeLink(document.getElementById('LinkSelectList').value);
    storedLinks = bg.getLinksData();
    document.getElementById('linksInput').value = "";
    renderList();
  });

  var saveCurrentPageButton = document.createElement("button");
  saveCurrentPageButton.innerHTML = "+ current page";
  saveCurrentPageButton.addEventListener("click",function(){
    bg.addLinksData(currentTabUrl);
    renderList();
  });

  var selectList = document.createElement('select');
  selectList.id = 'LinkSelectList';
  selectList.multiple = 'multiple';



  function renderList(){
    document.getElementById('LinkSelectList').innerHTML = "";
    for(var i=storedLinks.length - 1 ;i >= 0;i--){
      var linkOption = document.createElement('option');
      if( i == storedLinks.length - 1){
        linkOption.selected = 'selected';
      }
      linkOption.text = storedLinks[i];
      var linkOptionImageURL = (storedLinks[i])?storedLinks[i].split("/")[0]:"";
      linkOption.style.backgroundImage = "url('http://www.google.com/s2/favicons?domain="+linkOptionImageURL+"')";
      linkOption.style.backgroundRepeat = "no-repeat";
      linkOption.style.paddingLeft ="20px";
      linkOption.style.paddingTop = "2px";
      document.getElementById('LinkSelectList').appendChild(linkOption);
    }
  }
  //Appending everything in order to the UI
  document.getElementById('result').innerHTML = "";
  document.getElementById('result').appendChild(userInput);
  document.getElementById('result').appendChild(addLinkButton);
  document.getElementById('result').appendChild(removeLinkButton);
  document.getElementById('result').appendChild(saveCurrentPageButton);
  document.getElementById('result').appendChild(selectList);

  renderList();
  userInput.focus();
  //Add filtering logic for links here
}

/*************HEPLER FUNCTIONS******************/
// type - GET/POST
// url = URL
// response_type = document, XML, json, text
// callback - function to be called after onload
function ajax(type,url,response_type,callback){
  var xhr = new XMLHttpRequest();
  /*xhr.onload = function(xhr) {
    callback(xhr);
  };*/

  xhr.open(type, url);
  xhr.responseType = response_type;
  xhr.onreadystatechange = function() {
    if (xhr.readyState==4 && xhr.status==200){
      callback(xhr);
    }else if(xhr.status === 404){
      errorMessage("The page is missing. Try a different input");
    }else if(xhr.status === 403){
      errorMessage("Forbidden. Please check your firewall settings.");
    }else{
      //errorMessage("An error occurred");
    }

  }
  xhr.send();
  document.getElementById("result").innerHTML="<div class='Loading'><span>Loading</span></div>";
}

function output(output,input){
  if(output.length === 0 ){
    chat(input);
  }
  else if(typeof output === 'string'){
    document.getElementById("result").innerHTML="<div class='answerSingle'><span>"+output+"</span></div>";
  }else{
    document.getElementById("result").innerHTML = "";
    var answer = document.createElement("div");
    answer.className='answer';
    for(var i=0;i<output.length;i++){
      answer.appendChild(output[i]);
    }
    document.getElementById('result').appendChild(answer);
  }


}

function errorMessage(errorMsg){
  document.getElementById("result").innerHTML="<div class='error'><span>"+errorMsg+"</span></div>";
}

function clearResult(){
  document.getElementById('result').innerHTML = "";
}

var commands = [
  {
    name: "help",
    description: "Please try typing the following",
    sub_description: "<ul><li>define</li><li>wiki</li></urll>",
    example:""
  },{
    name: "define",
    description: "Finds google-dictionary meaning of the word mentioned next",
    sub_description: "Uses http://google-dictionary.so8848.com",
    example:"define browser"
  },{
    name: "wiki",
    description: "Searches wikipedia for the mentioned topic",
    sub_description: "uses www.wikipedia.org , If found it directly displays the initial few paragraphs of the topic",
    example:"wiki browser"
  },{
    name: "notess", //multiple keywords: scratch, note, notepad
    description: "Opens a quick notepad wherein you can save data",
    sub_description: "",
    example:""
  },{
    name: "reminder", //multiple keywords: remind, reminders, reminder
    description: "Opens your reminders if you have set any",
    sub_description: "",
    example:""
  },{
    name: "settings", //options , settings, preferences
    description: "Opens the settings page where you can customize",
    sub_description: "",
    example:""
  },{
    name: "quote", //quote
    description: "Fetches the quote of the day",
    sub_description: "",
    example:""
  }
];
