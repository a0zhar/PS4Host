var decoder = new TextDecoder();

if (localStorage.passcount == null) localStorage.passcount = 0;
window.passCounter.innerHTML = localStorage.passcount;
if (localStorage.failcount == null) localStorage.failcount = 0;
window.failCounter.innerHTML = localStorage.failcount;

function loadFile(fileName) {
  let xhr = new XMLHttpRequest();
  xhr.open("GET", fileName, false);
  xhr.overrideMimeType("text/plain; charset=x-user-defined");
  xhr.send();
  let array = Uint8Array.from(xhr.response, (c) => c.charCodeAt(0));
  if (fileName.endsWith(".bz2")) {
    try {
      PLS = bzip2.simple(bzip2.array(array));
    } catch (error) {
      alert(fileName + ': "' + error + '"\n');
      throw error;
    }
  }
  return array;
}

function load_hen(x) {
  msgs2.innerHTML = "GoldHEN Loading... please wait";
  LoadedMSG = "GoldHEN Loaded";
  setTimeout(function () {
    let array = loadFile(x);
    var payload = PLS;
    window.mira_blob_2_len = PLS.length;
    window.mira_blob_2 = malloc(window.mira_blob_2_len);
    write_mem(window.mira_blob_2, payload);
    var script = document.createElement("script");
    script.src = "exp_loader.js";
    document.getElementsByTagName("head")[0].appendChild(script);
  }, 1000);
  setTimeout(jailbreak, 500);
}

function load_mira(x) {
  msgs2.innerHTML = "Mira Loading... please wait";
  LoadedMSG = "Mira Loaded";
  setTimeout(function () {
    let array = loadFile(x);
    var payload = PLS;
    window.mira_blob_2_len = PLS.length;
    window.mira_blob_2 = malloc(window.mira_blob_2_len);
    write_mem(window.mira_blob_2, payload);
    var script = document.createElement("script");
    script.src = "exp_loader.js";
    document.getElementsByTagName("head")[0].appendChild(script);
  }, 1000);
  setTimeout(jailbreak, 500);
}
function load_binloader() {
  msgs2.innerHTML = "Binloader loading... please wait";
  LoadedMSG = "Payload Loaded ,Send Payload To Port 9021";
  var script = document.createElement("script");
  script.src = "exp_loader.js";
  document.getElementsByTagName("head")[0].appendChild(script);
}
function load_Pl(x) {
  msgs2.innerHTML = "Payload loading... please wait";
  LoadedMSG = "Payload Loaded";
  setTimeout(function () {
    let array = loadFile(x);
    var payload = PLS;
    window.mira_blob_2_len = PLS.length;
    window.mira_blob_2 = malloc(window.mira_blob_2_len);
    write_mem(window.mira_blob_2, payload);
    var script = document.createElement("script");
    script.src = "exp_loader.js";
    document.getElementsByTagName("head")[0].appendChild(script);
  }, 1000);
}

function load_SPF() {
  msgs2.innerHTML = "<div>Loading Firmware Spoof ...</div>";
  LoadedMSG = "Payload Loaded";
  fw1 = parseInt(fws1.value, 16);
  fw2 = parseInt(fws2.value, 16);
  spoof();
  var script = document.createElement("script");
  script.src = "exp_loader.js";
  document.getElementsByTagName("head")[0].appendChild(script);
}
function load_fanthresh() {
  msgs2.innerHTML = "<div>Loading Fan Threshold ...</div>";
  LoadedMSG = "Fan Threshold Loaded";
  fanTemp = tempC.value;
  fan();
  var script = document.createElement("script");
  script.src = "exp_loader.js";
  document.getElementsByTagName("head")[0].appendChild(script);
}
function load_web() {
  MyItems.style.display = "none";
  msgs2.innerHTML = "<div>Loading Web activator. Please wait ...</div>";
  var script = document.createElement("script");
  script.src = "payload.js";
  document.getElementsByTagName("head")[0].appendChild(script);
  var script = document.createElement("script");
  script.src = "pl_loader2.js";
  document.getElementsByTagName("head")[0].appendChild(script);
}
function preweb() {
  var script = document.createElement("script");
  script.src = "frontend.js";
  document.getElementsByTagName("head")[0].appendChild(script);
}

function allhens() {
  all.style.display = "none";
  hens.style.display = "block";
}
function allrestore() {
  all.style.display = "none";
  restore.style.display = "block";
}
function alltools() {
  all.style.display = "none";
  tools.style.display = "block";
}
function alldump() {
  all.style.display = "none";
  dump.style.display = "block";
}
function alllinux() {
  all.style.display = "none";
  linux.style.display = "block";
}
function allmods() {
  all.style.display = "none";
  gtav.style.display = "block";
}
function backall() {
  all.style.display = "block";
  hens.style.display = "none";
  restore.style.display = "none";
  tools.style.display = "none";
  dump.style.display = "none";
  linux.style.display = "none";
  gtav.style.display = "none";
}
