document.getElementById("search-input").addEventListener("input",(function(){const e=document.getElementById("search-input").value.toLowerCase(),t=document.querySelectorAll(".result-item");let n=!1;e.length<3?(t.forEach((e=>{e.classList.remove("hidden")})),n=!0):t.forEach((t=>{t.textContent.toLowerCase().includes(e)?(t.classList.remove("hidden"),n=!0):t.classList.add("hidden")})),document.getElementById("no-results").classList.toggle("hidden",n)}));