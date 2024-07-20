function DLProgress(e) {
    parent.ScrOverlay.style.display = "block";
    Percent = (Math.round(e.loaded / e.total * 100));
    parent.cacheUPDtxt.innerHTML = "Installing Offline Cache: " + Percent + "%";
    parent.CacheBar.style.width = Percent + '%';
  }

  function DisplayCacheProgress() {
    setTimeout(function() {
      parent.cacheUPDtxt.innerHTML = "Cache Installed Successfully. Reopen the Browser!!";
    }, 1000);
  }
  window.applicationCache.addEventListener("progress", DLProgress, false);
  window.applicationCache.oncached = function(e) {
    DisplayCacheProgress();
  };
  window.applicationCache.onupdateready = function(e) {
    DisplayCacheProgress();
  };
  window.applicationCache.onerror = function(e) {
    parent.cacheUPDtxt.innerHTML = "Error Installing Cache";
  };

  function showdate() {
    var dt = new Date();
    Hour = dt.getHours();
    Minute = dt.getMinutes();
    Day = dt.getDate();
    Month = dt.getMonth() + 1;
    Year = dt.getFullYear();
    if (Minute < 10) {
      Minute = "0" + Minute;
    };
    if (Hour < 10) {
      Hour = "0" + Hour;
    };
    document.getElementById("date").innerHTML = (Day + "/" + Month + "/" + Year);
    document.getElementById("clock").innerHTML = (Hour + ":" + Minute);
  }
  setInterval(showdate, 0);