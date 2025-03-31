// const TFJS_URL = "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js";
//let tfIframe = null;
const NOT_AVAILABLE = "N/A";
const FINAL_HTML = '<!doctype html><html lang=en><head><meta charset=UTF-8><meta name=viewport content="width=device-width,initial-scale=1"><title>Photo Archive</title><script src=https://unpkg.com/ag-grid-community/dist/ag-grid-community.min.js></script><style>.grid-wrapper{display:flex;flex-direction:column;height:100%;width:100%}.grid-header{font-family:Verdana,Geneva,Tahoma,sans-serif;font-size:13px;margin-bottom:10px;padding:10px;display:flex;align-items:center;gap:10px}.grid-and-preview{display:flex;flex-direction:row;flex:1;height:100%;position:relative}#myGrid{flex:3;width:100%;height:100%}.preview-div{flex:1;flex-direction:column;background-color:#f0f0f0;padding:10px;display:flex;justify-content:center;align-items:center;font-size:18px;color:#333;height:100%;box-sizing:border-box;overflow:hidden;object-fit:contain}.preview-div img{width:100%;height:100%;object-fit:contain}.resize-handle{width:10px;height:100%;cursor:ew-resize;background-color:#ccc;right:0;top:0;z-index:1}.cols_wnd{display:none;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:400px;height:70%;background:#fff;border:1px solid #000;padding:20px;flex-direction:column;z-index:9999}.close_wnd{position:absolute;top:5px;right:10px;cursor:pointer}.checkbox_list{flex:1;overflow-y:auto}.ok_cancel_btns{text-align:right;padding-top:10px}.svg-btn{background-color:transparent;border:none;cursor:pointer;align-items:baseline}.svg-btn svg{width:32px;height:32px;transition:fill .3s ease}svg{fill:#1E3050}.svg-link-photo{color:#1e3050;display:inline-block;width:16px;height:16px;background:url(\'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 512 512%22 fill="%231E3050"%3E%3Cpath d=%22M0 96C0 60.7 28.7 32 64 32l384 0c35.3 0 64 28.7 64 64l0 320c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 96zM323.8 202.5c-4.5-6.6-11.9-10.5-19.8-10.5s-15.4 3.9-19.8 10.5l-87 127.6L170.7 297c-4.6-5.7-11.5-9-18.7-9s-14.2 3.3-18.7 9l-64 80c-5.8 7.2-6.9 17.1-2.9 25.4s12.4 13.6 21.6 13.6l96 0 32 0 208 0c8.9 0 17.1-4.9 21.2-12.8s3.6-17.4-1.4-24.7l-120-176zM112 192a48 48 0 1 0 0-96 48 48 0 1 0 0 96z%22/%3E%3C/svg%3E\') no-repeat center center;background-size:contain;text-decoration:none}.svg-link-video{display:inline-block;width:16px;height:16px;background:url(\'data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 576 512\" fill="%231E3050"%3E%3Cpath d=\"M0 128C0 92.7 28.7 64 64 64l256 0c35.3 0 64 28.7 64 64l0 256c0 35.3-28.7 64-64 64L64 448c-35.3 0-64-28.7-64-64L0 128zM559.1 99.8c10.4 5.6 16.9 16.4 16.9 28.2l0 256c0 11.8-6.5 22.6-16.9 28.2s-23 5-32.9-1.6l-96-64L416 337.1l0-17.1 0-128 0-17.1 14.2-9.5 96-64c9.8-6.5 22.4-7.2 32.9-1.6z\"/%3E%3C/svg%3E\') no-repeat center center;background-size:contain;text-decoration:none}.svg-link-unknown{display:inline-block;width:16px;height:16px;background:url(\'data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 512 512\" fill="%231E3050"%3E%3Cpath d=\"M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm169.8-90.7c7.9-22.3 29.1-37.3 52.8-37.3l58.3 0c34.9 0 63.1 28.3 63.1 63.1c0 22.6-12.1 43.5-31.7 54.8L280 264.4c-.2 13-10.9 23.6-24 23.6c-13.3 0-24-10.7-24-24l0-13.5c0-8.6 4.6-16.5 12.1-20.8l44.3-25.4c4.7-2.7 7.6-7.7 7.6-13.1c0-8.4-6.8-15.1-15.1-15.1l-58.3 0c-3.4 0-6.4 2.1-7.5 5.3l-.4 1.2c-4.4 12.5-18.2 19-30.6 14.6s-19-18.2-14.6-30.6l.4-1.2zM224 352a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z\"/%3E%3C/svg%3E\') no-repeat center center;background-size:contain;text-decoration:none}</style><style media="only screen">:root,body{height:100%;width:100%;margin:0;box-sizing:border-box;-webkit-overflow-scrolling:touch}html{position:absolute;top:0;left:0;padding:0;overflow:auto;font-family:-apple-system,"system-ui","Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans","Liberation Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji"}body{padding:10px;overflow:auto;background-color:transparent;display:flex;height:100vh}</style></head><body><div class=grid-wrapper><div class=grid-header><input id=quick_filter placeholder="Quick Filter..." style=height:32px;width:250px><button id=search_btn onclick=searchGrid() class=svg-btn><svg xmlns=http://www.w3.org/2000/svg viewBox="0 0 512 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/></svg></button><button id=col_prefs_btn class=svg-btn onClick=onColsPrefClick()><svg xmlns=http://www.w3.org/2000/svg viewBox="0 0 512 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M0 96C0 60.7 28.7 32 64 32l384 0c35.3 0 64 28.7 64 64l0 320c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 96zm64 0l0 64 64 0 0-64L64 96zm384 0L192 96l0 64 256 0 0-64zM64 224l0 64 64 0 0-64-64 0zm384 0l-256 0 0 64 256 0 0-64zM64 352l0 64 64 0 0-64-64 0zm384 0l-256 0 0 64 256 0 0-64z"/></svg></button><button id=clean_saved_state_btn class=svg-btn onClick=onCleanSavedState()><svg xmlns=http://www.w3.org/2000/svg viewBox="0 0 576 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M290.7 57.4L57.4 290.7c-25 25-25 65.5 0 90.5l80 80c12 12 28.3 18.7 45.3 18.7L288 480l9.4 0L512 480c17.7 0 32-14.3 32-32s-14.3-32-32-32l-124.1 0L518.6 285.3c25-25 25-65.5 0-90.5L381.3 57.4c-25-25-65.5-25-90.5 0zM297.4 416l-9.4 0-105.4 0-80-80L227.3 211.3 364.7 348.7 297.4 416z"/></svg></button></div><div class=grid-and-preview><div id=myGrid></div><div class=resize-handle id=resize-handle></div><div class=preview-div id=preview_pane>Preview</div></div></div><div id=col_prefs class=cols_wnd><span id=close_prefs class=close_wnd onClick=onClosePrefsClick()>X</span><div class=select_deselect_btns><button id=select_all_btn onClick=onSelectAllClick()>Select All</button><button id=deselect_all_btn onClick=onDeselectAllClick()>Deselect All</button></div><div class=checkbox_list id=col_list></div><div class=ok_cancel_btns><button id=ok_prefs onClick=onOkPrefsClick()>OK</button><button id=cancel_prefs onClick=onCancelPrefsClick()>Cancel</button></div></div><script>const NOT_AVAILABLE="N/A",iconColumnLabel=" ";let resizeObserver=null;const isDebug=!0;let sourceData={source_data};document.getElementById("quick_filter").addEventListener("keydown",(function(t){"Enter"===t.key&&(t.preventDefault(),document.getElementById("search_btn").click())}));const columnDefs=[{headerName:" ",field:"icon",filter:!1,minWidth:50,cellRenderer:t=>{const a="image"==t.value?"svg-link-photo":"video"==t.value?"svg-link-video":"svg-link-unknown";return`<a href="${t.data.filePath}" target="_blank" class="${a}"></a>`}},{headerName:"File Name",field:"fileName",filter:"agTextColumnFilter",minWidth:200},{headerName:"Objects Detected",field:"objectsDetected",filter:"agTextColumnFilter",minWidth:200},{headerName:"OCRed Text",field:"ocrText",filter:"agTextColumnFilter",minWidth:200},{headerName:"Resolution",field:"resolution",filter:"agTextColumnFilter",minWidth:130},{headerName:"Video Duration",field:"videoDuration",filter:"agNumberColumnFilter",minWidth:160,cellRenderer:t=>formatDuration(t.value)},{headerName:"Date Created",field:"dateCreated",filter:"agDateColumnFilter",minWidth:170,valueFormatter:t=>{let a=t.value?new Date(t.value):null;return null===a||isNaN(a)?"":a.toLocaleString("en-GB",{year:"numeric",month:"short",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:!1}).replace(",","")}},{headerName:"Cities",field:"closestCities",filter:"agTextColumnFilter",minWidth:200},{headerName:"Cities Alt Names",field:"closestCitiesAltName",filter:"agTextColumnFilter",hide:!0,minWidth:200},{headerName:"Countries",field:"closestCountries",filter:"agTextColumnFilter",minWidth:200},{headerName:"GPS Lat",field:"latitude",filter:"agNumberColumnFilter",minWidth:110},{headerName:"GPS Lon",field:"longitude",filter:"agNumberColumnFilter",minWidth:110},{headerName:"Camera Model",field:"cameraModel",filter:"agTextColumnFilter",minWidth:200},{headerName:"Camera Manufacturer",field:"cameraManufacturer",filter:"agTextColumnFilter",minWidth:200},{headerName:"File Path",field:"filePath",filter:"agTextColumnFilter",hide:!0,minWidth:200},{headerName:"Size",field:"fileSize",filter:"agNumberColumnFilter",minWidth:100,valueFormatter:t=>formatBytes(t.value)},{headerName:"File Type",field:"fileType",filter:"agTextColumnFilter",hide:!0,minWidth:100},{headerName:"Width",field:"width",filter:"agNumberColumnFilter",minWidth:100},{headerName:"Height",field:"height",filter:"agNumberColumnFilter",minWidth:100},{headerName:"previewData",field:"previewData",hide:!0,minWidth:100},{headerName:"objectsDetectedData",field:"objectsDetectedData",hide:!0,minWidth:100}],rowData=sourceData.map((t=>({icon:t.isImage?"image":t.isVideo?"video":"unknown",fileName:t.fileName,filePath:t.filePath,fileSize:t.fileSize,fileType:t.fileType,width:t.width,height:t.height,dateCreated:parseDate(t.dateCreated),objectsDetected:extractObjLabels(t),ocrText:extractOcrText(t),previewData:t.previewData,videoDuration:t.videoDuration,latitude:"N/A"==t.exifData.latitude?null:t.exifData.latitude,longitude:"N/A"==t.exifData.longitude?null:t.exifData.longitude,resolution:t.width+"x"+t.height,closestCities:t?.exifData?.closestCities?.length>0?t?.exifData?.closestCities?.map((t=>`${t.name} (${t.distance.toFixed(2)}km)`)).join(", "):"",closestCitiesAltName:t?.exifData?.closestCities?.length>0?t?.exifData?.closestCities?.map((t=>t.altname)).join(", "):"",closestCountries:t?.exifData?.closestCities?.length>0?[...new Set(t?.exifData?.closestCities?.map((t=>t.country_name)))].join(", "):"",cameraModel:t.exifData.cameraModel,cameraManufacturer:t.exifData.cameraManufacturer,objectsDetectedData:JSON.stringify(t.objectsDetected)}))),gridOptions={columnDefs:columnDefs,rowData:rowData,pagination:!0,paginationPageSize:100,paginationPageSizeSelector:[10,25,100,1e3,1e4,1e7],defaultColDef:{sortable:!0,filter:!0,flex:1,floatingFilter:!0,resizable:!0},suppressHorizontalScroll:!1,suppressAutoSize:!1,onRowDoubleClicked:function(t){const a=adGridInstance.getCellRendererInstances({rowNodes:[t.node],columns:["icon"]})[0].getGui().querySelector("a");a&&a.click()},onRowClicked:function(t){if(t.data.previewData){const a=formatGoogleMapsLink(t.data),e=t.data.objectsDetectedData.replaceAll(\'"\',\'\\\\"\');document.getElementById("preview_pane").innerHTML=`<div>${a}</div><div class="preview-div"><img src="${t.data.previewData}" onload=\'drawDetectedObjects("${e}", this)\'></div>`}}},gridDiv=document.querySelector("#myGrid"),agGridInstance=agGrid.createGrid(gridDiv,gridOptions);function onColsPrefClick(){const t=document.getElementById("col_list");t.innerHTML="";agGridInstance.getColumnState().forEach((a=>{const e=columnDefs.find((t=>t.field===a.colId));let r=e?e.headerName:a.colId;" "==r&&(r="Icon Column");const S=a.hide?"":"checked";t.insertAdjacentHTML("beforeend",`<div><input type="checkbox" class="col_checkbox" data-field="${a.colId}" ${S}> ${r}</div>`)})),document.getElementById("col_prefs").style.display="flex"}function hidePrefs(){document.getElementById("col_prefs").style.display="none"}function onClosePrefsClick(){hidePrefs()}function onCancelPrefsClick(){hidePrefs()}function onOkPrefsClick(){const t=Array.from(document.querySelectorAll("#col_list .col_checkbox:checked")).map((t=>t.getAttribute("data-field")));columnDefs.forEach((a=>{const e=t.includes(a.field);agGridInstance.setColumnsVisible([a.field],e)})),hidePrefs()}function onSelectAllClick(){document.querySelectorAll("#col_list .col_checkbox").forEach((t=>{t.checked=!0}))}function onDeselectAllClick(){document.querySelectorAll("#col_list .col_checkbox").forEach((t=>{t.checked=!1}))}function searchGrid(){const t=document.getElementById("quick_filter").value;agGridInstance.setGridOption("quickFilterText",t)}agGridInstance.addEventListener("columnMoved",(function(){saveAgGridStateToLocalStorage()})),agGridInstance.addEventListener("columnVisible",(function(){saveAgGridStateToLocalStorage()})),agGridInstance.addEventListener("columnResized",(function(){saveAgGridStateToLocalStorage()})),agGridInstance.addEventListener("sortChanged",(function(){saveAgGridStateToLocalStorage()})),agGridInstance.addEventListener("paginationChanged",(function(){saveAgGridStateToLocalStorage()})),loadAgGridStateFromLocalStorage();const previewDiv=document.querySelector(".preview-div"),resizeHandle=document.querySelector("#resize-handle");let isResizing=!1;function resizePreviewDiv(t){if(isResizing){const a=Math.round(t.clientX-resizeHandle.getBoundingClientRect().left),e=Math.round(previewDiv.getBoundingClientRect().width-Math.round(a));previewDiv.style.flex=`0 0 ${e}px`}}function removeDuplicates(t){return[...new Set(t.split(", ").map((t=>t.toLowerCase())))].map(((a,e,r)=>t.split(", ").find((t=>t.toLowerCase()===a)))).join(", ")}function extractObjLabels(t){return t.isVideo?removeDuplicates(t.framesData.flatMap((t=>t.objectsDetected.map((t=>t.label)))).join(", ")):t.isImage?removeDuplicates(t.objectsDetected.length>0?t.objectsDetected.map((t=>t.label)).join(", "):""):""}function extractOcrText(t){return t.isVideo?removeDuplicates(t.framesData.map((t=>t.ocrText)).join(", ")):t.isImage?t.ocrText:""}function formatDuration(t){const a=Math.floor(t/3600),e=Math.floor(t%3600/60),r=Math.floor(t%60),S=Math.round(t%1*1e3);return`${String(a).padStart(2,"0")}:${String(e).padStart(2,"0")}:${String(r).padStart(2,"0")}.${String(S).padStart(3,"0")}`}function parseDate(t){let a=new Date(t);return isNaN(a)?null:a}function formatGoogleMapsLink(t){return t&&t.latitude&&t.longitude?`<a href="https://www.google.com/maps/place/${t.latitude},${t.longitude}" target="_blank">${t.latitude.toFixed(6)}, ${t.longitude.toFixed(6)}</a>`:""}function drawDetectedObjects(t,a){const e=document.getElementsByTagName("canvas");let r=null,S=null;if(r=e&&e.length>0?e[0]:document.createElement("canvas"),S=r.getContext("2d"),S.clearRect(0,0,r.width,r.height),t){const e=JSON.parse(t);if(e.length>0){resizeObserver&&(resizeObserver.disconnect(),resizeObserver=null),resizeObserver=new ResizeObserver((()=>{drawDetectedObjects(t,a)})),resizeObserver.observe(a.parentElement);const j=window.getComputedStyle(a.parentElement).paddingLeft.replaceAll("px",""),l=window.getComputedStyle(a.parentElement).paddingTop.replaceAll("px","");r.width=a.clientWidth,r.height=a.naturalHeight*a.clientWidth/a.naturalWidth,r.style.position="absolute",r.style.left=a.offsetLeft+j/2+"px",r.style.top=a.getBoundingClientRect().y+a.parentElement.clientHeight/2-r.height/2-l+"px",r.style.pointerEvents="none",document.body.appendChild(r),S.clearRect(0,0,r.width,r.height),S.strokeStyle="#E2FA41",S.lineWidth=2,S.font="14px Arial",S.fillStyle="#E2FA41",S.textBaseline="top",e.sort(((t,a)=>t.probability-a.probability)),e.forEach((t=>{const{xmin:a,ymin:e,xmax:j,ymax:l}=t.box,b=a*r.width,n=e*r.height,W=(j-a)*r.width,u=(l-e)*r.height;S.strokeRect(b,n,W,u);const x=`${t.label} ${(100*t.probability).toFixed(1)}%`;S.fillRect(b,n,S.measureText(x).width+6,20),S.fillStyle="#000",S.fillText(x,b+3,n+3),S.fillStyle="#E2FA41"}))}}}function logMsg(t,a=null,e=!1,r=!1){{const r=getCurrDateAsString();a?e?console.error(`[${r}] [ERROR] ${t}`,a):console.log(`[${r}] [DEBUG] ${t}`,a):e?console.error(`[${r}] [ERROR] ${t}`):console.log(`[${r}] [DEBUG] ${t}`)}}function getCurrDateAsString(){const t=new Date,a=t.getFullYear(),e=String(t.getDate()).padStart(2,"0");return`${a}-${String(t.getMonth()+1).padStart(2,"0")}-${e} ${String(t.getHours()).padStart(2,"0")}:${String(t.getMinutes()).padStart(2,"0")}:${String(t.getSeconds()).padStart(2,"0")}.${String(t.getMilliseconds()).padStart(3,"0")}`}function getAgGridState(){const t=agGridInstance.getColumnState();return{columns:t.map((t=>({colId:t.colId,hide:t.hide,width:t.width}))),sortedColumn:t.find((t=>t.sort)),columnOrder:t.map((t=>t.colId)),paginationState:{itemsPerPage:agGridInstance.paginationGetPageSize()}}}function saveAgGridStateToLocalStorage(){const t=getAgGridState(agGridInstance);localStorage.setItem("PhotoArchive.agGridState",JSON.stringify(t))}function loadAgGridStateFromLocalStorage(){const t=localStorage.getItem("PhotoArchive.agGridState");if(!t)return;const a=JSON.parse(t);agGridInstance.applyColumnState({state:a.columns.map((t=>({colId:t.colId,hide:t.hide,width:t.width}))),applyOrder:!0}),a.sortedColumn&&agGridInstance.applyColumnState({state:[{colId:a.sortedColumn.colId,sort:a.sortedColumn.sort}],defaultState:{sort:null}}),a.paginationState&&a.paginationState.itemsPerPage&&agGridInstance.setGridOption("paginationPageSize",a.paginationState.itemsPerPage)}function onCleanSavedState(){localStorage.removeItem("PhotoArchive.agGridState"),agGridInstance.resetColumnState()}function formatBytes(t){if(0===t)return"0 Bytes";const a=Math.floor(Math.log(t)/Math.log(1024)),e=["Bytes","KB","MB","GB","TB"][a];return`${(t/Math.pow(1024,a)).toFixed(2)} ${e}`}resizeHandle.addEventListener("mousedown",(t=>{isResizing=!0,document.addEventListener("mousemove",resizePreviewDiv),document.addEventListener("mouseup",(()=>{isResizing=!1,document.removeEventListener("mousemove",resizePreviewDiv)}))}))</script></body></html>';
const loadedModels = {}; // Object to store loaded ML models
let selectedModels = []; // Object to store loaded ML models
let isProcessingOnGoing = false;
let indexingProgress = 0;
let keepAliveInterval = null; // Reference to the interval
let startTimeInMS = 0;
const maxImageSizeForObjDetection = 2560;
let tfGlobal = null;

let minProbability = 0.8;// for 
let indexVideo = true;
//OCR related global variables
let ocrEnabled = true;
let minOCRProbability = 90;// for OCR this value range is from 0 to 100, not from 0.0 to 1.0.
let maxImageSizeForOCR = 1280;// Experimantally found that it has the best quality/speed ratio.

let filesLoopIntervalId = null;
let isFilesProcessRunning = false;

// Global canvas/context to be reused
let canvas = null;
let context = null;

const supportedLanguages = [
  { langCode: "eng", langName: "English" },
  { langCode: "cmn", langName: "Mandarin Chinese" },
  { langCode: "hin", langName: "Hindi" },
  { langCode: "spa", langName: "Spanish" },
  { langCode: "ara", langName: "Arabic" },
  { langCode: "fra", langName: "French" },
  { langCode: "ben", langName: "Bengali" },
  { langCode: "por", langName: "Portuguese" },
  { langCode: "rus", langName: "Russian" },
  { langCode: "urd", langName: "Urdu" },
  { langCode: "ind", langName: "Indonesian" },
  { langCode: "deu", langName: "German" },
  { langCode: "jpn", langName: "Japanese" },
  { langCode: "ita", langName: "Italian" },
  { langCode: "nld", langName: "Dutch" }
]

let selectedLanguages = ["eng", "fra", "nld"];
let langListElement;
let addPreview = true;
let extractExif = true;
let videoIndexingInterval = 1000;
let processedFiles = [];
let isDebug = false;
let tfDefaultBackend = "";
let tfAlternativeBackend = "webgl";//can try wasm, webgpu, cpu, webgl
let previewSize = 400;

let isYOLOv8Selected = false;
let isMobileNetSelected = false;
let isEfficientDetSelected = true;
let fileCount = 0;
let filesToIndex;
let mediaInfo;
let loadingEl;
let supportedTfBackend = ["cpu", "webgl", "wasm"]; //https://www.tensorflow.org/js/guide/platform_environment#backends

/*const modelURLs = {
  yolov8: "https://cdn.glitch.global/2892a8df-05be-426e-9418-39b6f32c75cb/model.json",
  //mobilenet: "https://tfhub.dev/google/imagenet/mobilenet_v2_100_224/classification/4",
  //mobilenet: "https://www.kaggle.com/models/google/mobilenet-v2/TfJs/140-224-classification/3",
  mobilenet: "https://storage.googleapis.com/tfjs-models/savedmodel/ssd_mobilenet_v2/model.json",
  //mobilenet: "https://storage.googleapis.com/tfjs-models/savedmodel/ssdlite_mobilenet_v2/model.json",
  //efficientdet: "https://tfhub.dev/tensorflow/efficientdet/lite2/detection/1"
  //efficientdet: "https://www.kaggle.com/models/tensorflow/efficientdet/TensorFlow2/d7/1"
  efficientdet: "https://cdn.glitch.global/ff1f5dc9-0921-477a-82d5-e3c1157e4a98/"
};*/

const modelInfos = [
  {
    name: "yolov8",
    label: "YOLOv8",
    url: "https://cdn.glitch.global/2892a8df-05be-426e-9418-39b6f32c75cb/model.json"
  },
  /* mobilenet does not work well and gives the same results as efficientdet
  {
    name: "mobilenet",
    label: "MobileNet",
    url: "https://storage.googleapis.com/tfjs-models/savedmodel/ssd_mobilenet_v2/model.json"
  },*/
  {
    name: "efficientdet",
    label: "EfficientDet",
    url: "https://cdn.glitch.global/ff1f5dc9-0921-477a-82d5-e3c1157e4a98/"
  }
];


const classLabelsED = [
  "person", "bicycle", "car", "motorcycle", "airplane", "bus", "train", "truck", "boat",
  "traffic light", "fire hydrant", "street sign", "stop sign", "parking meter", "bench",
  "bird", "cat", "dog", "horse", "sheep", "cow", "elephant", "bear", "zebra", "giraffe",
  "hat", "backpack", "umbrella", "shoe", "eye glasses", "handbag", "tie", "suitcase",
  "frisbee", "skis", "snowboard", "sports ball", "kite", "baseball bat", "baseball glove",
  "skateboard", "surfboard", "tennis racket", "bottle", "plate", "wine glass", "cup",
  "fork", "knife", "spoon", "bowl", "banana", "apple", "sandwich", "orange", "broccoli",
  "carrot", "hot dog", "pizza", "donut", "cake", "chair", "couch", "potted plant", "bed",
  "mirror", "dining table", "window", "desk", "toilet", "door", "tv", "laptop", "mouse",
  "remote", "keyboard", "cell phone", "microwave", "oven", "toaster", "sink", "refrigerator",
  "blender", "book", "clock", "vase", "scissors", "teddy bear", "hair drier", "toothbrush",
  "hair brush"
];

const classLabelsYOLOv8 = ["Accordion", "Adhesive tape", "Aircraft", "Airplane", "Alarm clock", "Alpaca", "Ambulance", "Animal", "Ant", "Antelope", "Apple", "Armadillo", "Artichoke", "Auto part", "Axe", "Backpack", "Bagel", "Baked goods", "Balance beam", "Ball", "Balloon", "Banana", "Band-aid", "Banjo", "Barge", "Barrel", "Baseball bat", "Baseball glove", "Bat (Animal)", "Bathroom accessory", "Bathroom cabinet", "Bathtub", "Beaker", "Bear", "Bed", "Bee", "Beehive", "Beer", "Beetle", "Bell pepper", "Belt", "Bench", "Bicycle", "Bicycle helmet", "Bicycle wheel", "Bidet", "Billboard", "Billiard table", "Binoculars", "Bird", "Blender", "Blue jay", "Boat", "Bomb", "Book", "Bookcase", "Boot", "Bottle", "Bottle opener", "Bow and arrow", "Bowl", "Bowling equipment", "Box", "Boy", "Brassiere", "Bread", "Briefcase", "Broccoli", "Bronze sculpture", "Brown bear", "Building", "Bull", "Burrito", "Bus", "Bust", "Butterfly", "Cabbage", "Cabinetry", "Cake", "Cake stand", "Calculator", "Camel", "Camera", "Can opener", "Canary", "Candle", "Candy", "Cannon", "Canoe", "Cantaloupe", "Car", "Carnivore", "Carrot", "Cart", "Cassette deck", "Castle", "Cat", "Cat furniture", "Caterpillar", "Cattle", "Ceiling fan", "Cello", "Centipede", "Chainsaw", "Chair", "Cheese", "Cheetah", "Chest of drawers", "Chicken", "Chime", "Chisel", "Chopsticks", "Christmas tree", "Clock", "Closet", "Clothing", "Coat", "Cocktail", "Cocktail shaker", "Coconut", "Coffee", "Coffee cup", "Coffee table", "Coffeemaker", "Coin", "Common fig", "Common sunflower", "Computer keyboard", "Computer monitor", "Computer mouse", "Container", "Convenience store", "Cookie", "Cooking spray", "Corded phone", "Cosmetics", "Couch", "Countertop", "Cowboy hat", "Crab", "Cream", "Cricket ball", "Crocodile", "Croissant", "Crown", "Crutch", "Cucumber", "Cupboard", "Curtain", "Cutting board", "Dagger", "Dairy Product", "Deer", "Desk", "Dessert", "Diaper", "Dice", "Digital clock", "Dinosaur", "Dishwasher", "Dog", "Dog bed", "Doll", "Dolphin", "Door", "Door handle", "Doughnut", "Dragonfly", "Drawer", "Dress", "Drill (Tool)", "Drink", "Drinking straw", "Drum", "Duck", "Dumbbell", "Eagle", "Earrings", "Egg (Food)", "Elephant", "Envelope", "Eraser", "Face powder", "Facial tissue holder", "Falcon", "Fashion accessory", "Fast food", "Fax", "Fedora", "Filing cabinet", "Fire hydrant", "Fireplace", "Fish", "Flag", "Flashlight", "Flower", "Flowerpot", "Flute", "Flying disc", "Food", "Food processor", "Football", "Football helmet", "Footwear", "Fork", "Fountain", "Fox", "French fries", "French horn", "Frog", "Fruit", "Frying pan", "Furniture", "Garden Asparagus", "Gas stove", "Giraffe", "Girl", "Glasses", "Glove", "Goat", "Goggles", "Goldfish", "Golf ball", "Golf cart", "Gondola", "Goose", "Grape", "Grapefruit", "Grinder", "Guacamole", "Guitar", "Hair dryer", "Hair spray", "Hamburger", "Hammer", "Hamster", "Hand dryer", "Handbag", "Handgun", "Harbor seal", "Harmonica", "Harp", "Harpsichord", "Hat", "Headphones", "Heater", "Hedgehog", "Helicopter", "Helmet", "High heels", "Hiking equipment", "Hippopotamus", "Home appliance", "Honeycomb", "Horizontal bar", "Horse", "Hot dog", "House", "Houseplant", "Human arm", "Human beard", "Human body", "Human ear", "Human eye", "Human face", "Human foot", "Human hair", "Human hand", "Human head", "Human leg", "Human mouth", "Human nose", "Humidifier", "Ice cream", "Indoor rower", "Infant bed", "Insect", "Invertebrate", "Ipod", "Isopod", "Jacket", "Jacuzzi", "Jaguar (Animal)", "Jeans", "Jellyfish", "Jet ski", "Jug", "Juice", "Kangaroo", "Kettle", "Kitchen & dining room table", "Kitchen appliance", "Kitchen knife", "Kitchen utensil", "Kitchenware", "Kite", "Knife", "Koala", "Ladder", "Ladle", "Ladybug", "Lamp", "Land vehicle", "Lantern", "Laptop", "Lavender (Plant)", "Lemon", "Leopard", "Light bulb", "Light switch", "Lighthouse", "Lily", "Limousine", "Lion", "Lipstick", "Lizard", "Lobster", "Loveseat", "Luggage and bags", "Lynx", "Magpie", "Mammal", "Man", "Mango", "Maple", "Maracas", "Marine invertebrates", "Marine mammal", "Measuring cup", "Mechanical fan", "Medical equipment", "Microphone", "Microwave oven", "Milk", "Miniskirt", "Mirror", "Missile", "Mixer", "Mixing bowl", "Mobile phone", "Monkey", "Moths and butterflies", "Motorcycle", "Mouse", "Muffin", "Mug", "Mule", "Mushroom", "Musical instrument", "Musical keyboard", "Nail (Construction)", "Necklace", "Nightstand", "Oboe", "Office building", "Office supplies", "Orange", "Organ (Musical Instrument)", "Ostrich", "Otter", "Oven", "Owl", "Oyster", "Paddle", "Palm tree", "Pancake", "Panda", "Paper cutter", "Paper towel", "Parachute", "Parking meter", "Parrot", "Pasta", "Pastry", "Peach", "Pear", "Pen", "Pencil case", "Pencil sharpener", "Penguin", "Perfume", "Person", "Personal care", "Personal flotation device", "Piano", "Picnic basket", "Picture frame", "Pig", "Pillow", "Pineapple", "Pitcher (Container)", "Pizza", "Pizza cutter", "Plant", "Plastic bag", "Plate", "Platter", "Plumbing fixture", "Polar bear", "Pomegranate", "Popcorn", "Porch", "Porcupine", "Poster", "Potato", "Power plugs and sockets", "Pressure cooker", "Pretzel", "Printer", "Pumpkin", "Punching bag", "Rabbit", "Raccoon", "Racket", "Radish", "Ratchet (Device)", "Raven", "Rays and skates", "Red panda", "Refrigerator", "Remote control", "Reptile", "Rhinoceros", "Rifle", "Ring binder", "Rocket", "Roller skates", "Rose", "Rugby ball", "Ruler", "Salad", "Salt and pepper shakers", "Sandal", "Sandwich", "Saucer", "Saxophone", "Scale", "Scarf", "Scissors", "Scoreboard", "Scorpion", "Screwdriver", "Sculpture", "Sea lion", "Sea turtle", "Seafood", "Seahorse", "Seat belt", "Segway", "Serving tray", "Sewing machine", "Shark", "Sheep", "Shelf", "Shellfish", "Shirt", "Shorts", "Shotgun", "Shower", "Shrimp", "Sink", "Skateboard", "Ski", "Skirt", "Skull", "Skunk", "Skyscraper", "Slow cooker", "Snack", "Snail", "Snake", "Snowboard", "Snowman", "Snowmobile", "Snowplow", "Soap dispenser", "Sock", "Sofa bed", "Sombrero", "Sparrow", "Spatula", "Spice rack", "Spider", "Spoon", "Sports equipment", "Sports uniform", "Squash (Plant)", "Squid", "Squirrel", "Stairs", "Stapler", "Starfish", "Stationary bicycle", "Stethoscope", "Stool", "Stop sign", "Strawberry", "Street light", "Stretcher", "Studio couch", "Submarine", "Submarine sandwich", "Suit", "Suitcase", "Sun hat", "Sunglasses", "Surfboard", "Sushi", "Swan", "Swim cap", "Swimming pool", "Swimwear", "Sword", "Syringe", "Table", "Table tennis racket", "Tablet computer", "Tableware", "Taco", "Tank", "Tap", "Tart", "Taxi", "Tea", "Teapot", "Teddy bear", "Telephone", "Television", "Tennis ball", "Tennis racket", "Tent", "Tiara", "Tick", "Tie", "Tiger", "Tin can", "Tire", "Toaster", "Toilet", "Toilet paper", "Tomato", "Tool", "Toothbrush", "Torch", "Tortoise", "Towel", "Tower", "Toy", "Traffic light", "Traffic sign", "Train", "Training bench", "Treadmill", "Tree", "Tree house", "Tripod", "Trombone", "Trousers", "Truck", "Trumpet", "Turkey", "Turtle", "Umbrella", "Unicycle", "Van", "Vase", "Vegetable", "Vehicle", "Vehicle registration plate", "Violin", "Volleyball (Ball)", "Waffle", "Waffle iron", "Wall clock", "Wardrobe", "Washing machine", "Waste container", "Watch", "Watercraft", "Watermelon", "Weapon", "Whale", "Wheel", "Wheelchair", "Whisk", "Whiteboard", "Willow", "Window", "Window blind", "Wine", "Wine glass", "Wine rack", "Winter melon", "Wok", "Woman", "Wood-burning stove", "Woodpecker", "Worm", "Wrench", "Zebra", "Zucchini"];

logMsg("Program started");

// for efficientdet looks like this one is the latest version: https://www.kaggle.com/models/tensorflow/efficientdet/tensorFlow2/d7
// but it has to be converted to tensorflow.js format (model.json + a few *.bin files)
// this is conversion guide: https://www.tensorflow.org/js/guide/conversion
// D7 is the most precise model, D0 most unprecise. liteN even worse than D0.
// with this URL: https://cdn.glitch.global/ff1f5dc9-0921-477a-82d5-e3c1157e4a98/ loading works fine. Model consists of model.json file and 46 *.bin files (reanmed to *.dat) to be able to upload to glitch.
// D7 takes 20 minutes to run for 1 image on CPU and it fails on GPU. Looks like it has to be simplier model. Will try D6, D5, etc.
// MobileNet latest best precise: ssd_mobilenet_v3_large_coco (https://github.com/tensorflow/models/blob/master/research/object_detection/g3doc/tf1_detection_zoo.md)

// YOLOv9 is released. https://github.com/WongKinYiu/yolov9?tab=readme-ov-file (YOLOv9 from here only has 80 labels from COCO dataset)
// can be downloaded from the page above by these links: https://github.com/WongKinYiu/yolov9/releases/download/v0.1/yolov9-e-converted.pt
// *.pt file is PyTorch model. It has to be converted to tensorflow.js models in 3 steps.
// ONNX model can be found here: https://huggingface.co/Xenova/yolov9-onnx/tree/main
// all YOLO versions: https://docs.ultralytics.com/models/yolo11/
// Try https://github.com/ultralytics/ultralytics/tree/v8.2.94 based on Open Image v7 (600 label)
// models export: https://docs.ultralytics.com/modes/export/#introduction
// Proper example how to use YOLOv8 in tfjs is here: https://github.com/asouqi/yolo-tfjs
// specifically, preprocessImage here https://github.com/asouqi/yolo-tfjs for image preprocessing
// getPredictionData here https://github.com/asouqi/yolo-tfjs/blob/master/src/yolo/YoloV8.ts for results postprocessing.

$(document).ready(async function() {
  logMsg("Document ready");

  window.addEventListener("unhandledrejection", event => {
    logMsg(`Unhandled promise rejection: ${event.reason}`);
    event.preventDefault(); // Prevents the warning from stopping execution
  });

  //tfIframe = document.getElementById("tf_iframe");
  //logMsg("iframe object", tfIframe);

  //logMsg("Wait for Tensorflow.js inside iframe to be loaded");
  //tfGlobal = await waitForTF(tfIframe);//from iframe
  tfGlobal = tf;//from this page
  //logMsg("Tensorflow.js inside iframe is loaded", tfGlobal);

  tfGlobal.setBackend("webgl");
  await tfGlobal.ready(); // Ensure the backend is initialized.)

  // to reload Tensorflow.js this code can be used tfIframe.contentWindow.location.reload();

  canvas = document.createElement("canvas");
  context = canvas.getContext("2d");

  loadingEl = $("#loading_el");

  //use this code to show loading element
  //loadingEl.show();
  //loadingEl.style("display", "flex");

  //use this code to hide loading element
  //loadingEl.hide();

  MediaInfo.mediaInfoFactory({ format: 'object' }, (mediaInfoInt) => {
    console.log("mediaInfoInt", mediaInfoInt);
    mediaInfo = mediaInfoInt;
  });

  // Step 1: Initialize UI elements with jQuery UI
  //$("#ml_models").selectable(); // Multiselect dropdown
  //$( "#yolov8, #mobilenet, #efficientdet" ).checkboxradio({icon: false});

  // init list of supported ML Models
  let mlModelsListElement = $("#ml_models")
  for (let i = 0; i < modelInfos.length; i++) {//using access by index because order is important
    mlModelsListElement.append(`<label for="${modelInfos[i].name}">${modelInfos[i].label}</label><input type="checkbox" name="${modelInfos[i].name}" id="${modelInfos[i].name}">&nbsp;`);
    $(`#${modelInfos[i].name}`).checkboxradio({ icon: false });
  }


  $("#index_video, #ocr_enabled, #add_preview, #extract_exif, #save_settings").checkboxradio();

  $("button").button();

  $("#index_video").change(function() {
    $("#video_indexing_interval").prop("disabled", !$(this).is(":checked"));
  });

  // init list of OCR supported languages
  let langListElement = $("#ocr_lang_list")
  for (let i = 0; i < supportedLanguages.length; i++) {//using access by index because order is important
    langListElement.append(`<label for="${supportedLanguages[i].langCode}">${supportedLanguages[i].langName}</label><input type="checkbox" name="${supportedLanguages[i].langCode}" id="${supportedLanguages[i].langCode}">&nbsp;`);
    $(`#${supportedLanguages[i].langCode}`).checkboxradio({ icon: false });
  }

  selectedLanguages.forEach(function(value) {
    let inputElement = $(`#ocr_lang_list input[type='checkbox'][id='${value}']`);
    inputElement.prop("checked", true);
    inputElement.checkboxradio("refresh");
  });

  // Event listeners for checkboxes to enable/disable related inputs
  $("#index_video").change(function() {
    $("#video_indexing_interval").prop("disabled", !$(this).is(":checked"));
    $("#video_indexing_interval_section").toggle($(this).is(":checked"));
  });

  $("#ocr_enabled").change(function() {
    $("#min_ocr_probability").prop("disabled", !$(this).is(":checked"));
    $("#min_ocr_probability_section").toggle($(this).is(":checked"));
    $("#ocr_lang_list_section").toggle($(this).is(":checked"));

  });

  $("#file_selector").button();

  $("#file_selector").change(function() {
    // Populate filesToIndex from the file_selector input
    const fileInput = $("#file_selector")[0];
    filesToIndex = Array.from(fileInput.files);
    if ((filesToIndex) && (filesToIndex.length > 0)) {
      fileCount = filesToIndex.length;
      $("#file_count").html(fileCount);
    }
  });

  // Step 2: Load saved settings from local storage
  loadSettingsFromStorage();

  $("#video_indexing_interval").prop("disabled", !$("#index_video").is(":checked"));
  $("#video_indexing_interval_section").toggle($("#index_video").is(":checked"));

  $("#min_ocr_probability").prop("disabled", !$("#ocr_enabled").is(":checked"));
  $("#min_ocr_probability_section").toggle($("#ocr_enabled").is(":checked"));
  $("#ocr_lang_list_section").toggle($("#ocr_enabled").is(":checked"));

  //tf.setBackend(tfAlternativeBackend); // Force TensorFlow.js to use the CPU backend.
  //await tf.ready(); // Ensure the backend is initialized.)

  // Step 3: Load all machine learning models
  //will load models only when start processing. It has to be reloaded anyway.
  /*await Promise.all([
    loadModel("yolov8"),
    //loadModel("mobilenet"),
    loadModel("efficientdet")
  ]);*/

  // Save original backend for Tensorflow (CPU or GPU(webgl)).
  // It will be used later in case of default backend processing will fail to swith to alternative backend.
  //tf.env().set('WEBGL_PACK', false);

  tfDefaultBackend = tfGlobal.getBackend();
  tfGlobal.disableDeprecationWarnings(); // Optional: Suppress warnings.
  // Supported backends according to official tensor flow documentation: https://www.tensorflow.org/js/guide/platform_environment#backends
  // wasm
  // cpu
  // webgl
  logMsg("Tensorflow default backend: " + tfDefaultBackend);
  $("#backend_used").html(tfDefaultBackend);

  await tfGlobal.ready();

  logMsg("tfGlobal is ready");

  //make a list of supported backends
  const backends = tfGlobal.engine().registry;
  logMsg('Tensorflow supported backends:', Object.keys(backends));

  // Step 4: Enable start button if models are loaded
  if (Object.values(loadedModels).every((loaded) => loaded)) {
    $("#start_btn").button("enable");
    loadingEl.hide();
  }

  // Step 5: "Start" button click event
  $("#start_btn").click(async function() {
    $("#start_btn").button("disable");
    $("#stop_btn").button("enable");

    startTimeInMS = Date.now();

    //read all values from form

    minProbability = parseFloat($("#min_probability").val(), 10); // Convert to a decimal
    indexVideo = $("#index_video").is(":checked");
    videoIndexingInterval = parseInt($("#video_indexing_interval").val(), 10);
    ocrEnabled = $("#ocr_enabled").is(":checked");
    minOCRProbability = parseFloat($("#min_ocr_probability").val(), 10);
    addPreview = $("#add_preview").is(":checked");
    extractExif = $("#extract_exif").is(":checked");

    selectedLanguages = $("#ocr_lang_list input[type='checkbox']:checked").map(function() {
      return this.id;
    }).get();
    logMsg("selectedLanguages: ", selectedLanguages);

    isYOLOv8Selected = $("#yolov8").is(":checked");
    isMobileNetSelected = $("#mobilenet").is(":checked");
    isEfficientDetSelected = $("#efficientdet").is(":checked");
    if (isYOLOv8Selected) {
      selectedModels.push("yolov8");
    }
    if (isMobileNetSelected) {
      selectedModels.push("mobilenet");
    }
    if (isEfficientDetSelected) {
      selectedModels.push("efficientdet");
    }

    logMsg("load models start");
    for (const loadedModelName of selectedModels) {
      await loadModel(loadedModelName);
    }

    saveSettingsToStorage();
    isProcessingOnGoing = true;
    startKeepAlive();
    logMsg("before processFiles()");
    await processFiles(); // Await the completion of processFiles
    logMsg("after processFiles()");
    isProcessingOnGoing = false;
    clearInterval(filesLoopIntervalId);
    $("#start_btn").button("enable");
    $("#stop_btn").button("disable");
  });

  // Step 6: "Stop" button click event
  // Call saveSettingsToStorage on "Stop" button click or other form completion events
  $("#stop_btn").click(function() {
    $(this).prop("disabled", true);
    $("#start_btn").prop("disabled", false);
    saveSettingsToStorage();
    isProcessingOnGoing = false;
    clearInterval(filesLoopIntervalId);
    // TODO: Stop the indexing process and save the final data
  });

});

const loadSettingsFromStorage = () => {
  const savedSettings = JSON.parse(window.localStorage.getItem("fileIndexingSettings"));
  if (savedSettings) {
    $("#mobilenet").prop("checked", savedSettings.mobilenet);
    $("#mobilenet").checkboxradio("refresh");
    $("#efficientdet").prop("checked", savedSettings.efficientdet);
    $("#efficientdet").checkboxradio("refresh");
    $("#yolov8").prop("checked", savedSettings.yolov8);
    $("#yolov8").checkboxradio("refresh");
    $("#min_probability").val(savedSettings.min_probability || 80.0);
    $("#index_video").attr("checked", savedSettings.index_video);
    $("#index_video").checkboxradio("refresh");
    $("#video_indexing_interval").val(savedSettings.video_indexing_interval || 1000);
    $("#ocr_enabled").attr("checked", savedSettings.ocr_enabled);
    $("#ocr_enabled").checkboxradio("refresh");
    $("#min_ocr_probability").val(savedSettings.min_ocr_probability || 90);
    selectedLanguages = savedSettings.selected_languages || selectedLanguages || ["eng"];
    $("#ocr_lang_list input[type='checkbox']").map(function() {
      let inputElement = $(this);
      let id = this.id;
      $(this).prop("checked", selectedLanguages.indexOf(id) > -1);
      $(this).checkboxradio("refresh");
    });
    $("#add_preview").attr("checked", savedSettings.add_preview);
    $("#add_preview").checkboxradio("refresh");
    $("#extract_exif").attr("checked", savedSettings.extract_exif);
    $("#extract_exif").checkboxradio("refresh");
    $("#save_settings").attr("checked", savedSettings.save_settings);
    $("#save_settings").checkboxradio("refresh");
  }
};

const saveSettingsToStorage = () => {
  if ($("#save_settings").is(":checked")) {
    const settings = {
      mobilenet: isMobileNetSelected,
      efficientdet: isEfficientDetSelected,
      yolov8: isYOLOv8Selected,
      min_probability: minProbability,
      index_video: indexVideo,
      video_indexing_interval: videoIndexingInterval,
      ocr_enabled: ocrEnabled,
      min_ocr_probability: minOCRProbability,
      selected_languages: selectedLanguages,
      add_preview: addPreview,
      extract_exif: extractExif,
      save_settings: $("#save_settings").is(":checked")
    };
    window.localStorage.setItem("fileIndexingSettings", JSON.stringify(settings));
  } else {
    window.localStorage.removeItem("fileIndexingSettings");
  }

};

const loadModel = async (modelName) => {
  try {
    let model;
    switch (modelName) {
      case "yolov8":
        model = await tfGlobal.loadGraphModel(modelInfos.find(model => model.name === modelName).url);
        break;
      /*case "mobilenet":
        // Load MobileNet model from TensorFlow Hub (tfHub requires additional dependency)
        //model = await tf.loadGraphModel(modelURLs[modelName], { fromTFHub: true });
        model = await tfGlobal.loadGraphModel(modelInfos.find(model => model.name === modelName).url);

        break;*/
      case "efficientdet":
        // Load EfficientDet model from TensorFlow Hub with fromTFHub option
        model = await tfGlobal.loadGraphModel(modelInfos.find(model => model.name === modelName).url, { fromTFHub: true });
        break;
      default:
        logMsg(`Model ${modelName} not recognized error`, true);
        return;
    }
    loadedModels[modelName] = model; // Store the loaded model
    logMsg(`${modelName} model loaded successfully`);
  } catch (error) {
    logMsg(`Error loading ${modelName}:`, error, true);
  }
};

const readChunk = async (chunkSize, startPosition) => {
  const chunk = file.slice(startPosition, startPosition + chunkSize);
  const arrayBuffer = await chunk.arrayBuffer();
  return new Uint8Array(arrayBuffer);
};

//const readChunk = async (chunkSize, offset) => new Uint8Array(await file.slice(offset, offset + chunkSize).arrayBuffer());


// define processFiles function
const processFiles = async () => {
  logMsg("processFiles started");
  processedFiles = []; // Array to hold processed file data
  logMsg("processFiles filesToIndex.length: " + fileCount);

  for (let i = 0; i < fileCount; i++) {
    try {
      // replacing for loop with setTimeout to avoid browser javascript throttling
      /*
      // loop replacement with setInterval() starts here
      let i = 0;
      
      async function processLoop() {
        return new Promise((resolve, reject) => {
          filesLoopIntervalId = setInterval(async () => {
            if (isFilesProcessRunning) {
              logMsg(`files processing loop with i: ${i} cannot be started because previous loop body is not finished yet and still running.`);
              return;
            }
    
            if (i >= fileCount) {
              clearInterval(filesLoopIntervalId); // Stop the interval
              logMsg(`processing loop is finished with i: ${i}`); // New line
              resolve();
              return;
            }
            isFilesProcessRunning = true;
            */
      logMsg(`Start file processing loop [i: ${i}, isProcessingOnGoing: ${isProcessingOnGoing}].`);
      let file = filesToIndex[i];
      let fileLastModifiedDate = file.lastModifiedDate || (file.lastModified ? new Date(file.lastModified) : null);//this is needed to support Firefox. lastModifiedDate is not defined in FireFox.

      logMsg(`processFiles start processing file[${i}] with the name: ${file.name}`);
      const fileData = {
        fileName: file.name,
        filePath: file.webkitRelativePath,
        lastModifiedDate: fileLastModifiedDate,
        objectsDetected: [],
        previewData: null,
        dateCreated: fileLastModifiedDate,// fill first from the file system and later will be overwritten from EXIF if exist
        exifData: {},
        ocrText: "",
        isImage: false,
        isVideo: false,
        framesData: [],
        fileType: file.type,
        width: 0,
        height: 0,
        videoDuration: 0,//Video duration in seconds
        fileSize: file.size,
        checkSum: ""
      };
      updateCurrentFileInfo(`${(i + 1)} - "${fileData.filePath}". file size: ${formatBytes(fileData.fileSize)}.`);
      
      fileData.checkSum = await getFileChecksum(file);

      // Determine if the file is a video or image based on its mime type.
      // Check for supported image formats and MP4 videos
      const isImage = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'].includes(file.type);
      const isVideo = ['video/mp4', 'video/quicktime'].includes(file.type);

      if (isVideo) {
        fileData.isVideo = true;
        updateCurrentOperation("Video Processing");
        logMsg(`indexVideo: ${indexVideo}`);
        if (indexVideo) {
          // Handle video processing
          await processVideo(file, fileData, minProbability, videoIndexingInterval, ocrEnabled, addPreview, extractExif);
        } else {
          updateCurrentOperation("Skip Video Processing");
        }
        updateCurrentOperation("Video Processing is Completed");
      } else if (isImage) {
        // Handle image processing
        fileData.isImage = true;
        updateCurrentOperation("Image Processing");
        await processImage(file, fileData, minProbability, ocrEnabled, addPreview, extractExif, "[Image] ");
        updateCurrentOperation("Image Processing is Completed");
      } else {
        // Log unsupported file types
        logMsg(`File type ${file.type} is not supported for file name ${file.name}`);
      }

      processedFiles.push(fileData);
      updateFinalStatus(i + 1);
      if (!isProcessingOnGoing) {
        logMsg(`Stopping further processing [isProcessingOnGoing: ${isProcessingOnGoing}].`);
        //break;// break is needed in case of for loop
        return;// return is used insdead of break in case of setTimeout loop
      }

      // code below is needed to replace for loop with setTimeout()
      logMsg(`Finish file processing loop [i: ${i}, isProcessingOnGoing: ${isProcessingOnGoing}].`);
      /*
      // loop replacement with setInterval() finishes here
      i++;
      isFilesProcessRunning = false;
    }, 100);
  });
}
await processLoop();
*/
    } catch (error) {
      logMsg(`Error inside processFiles file processing loop [i: ${i}, isProcessingOnGoing: ${isProcessingOnGoing}, filename: ${file.name}].`);
    }
  }

  updateCurrentOperation("Full Processing is Completed");
  logMsg("processFiles finished. Final files data: ", processedFiles);
  //$("#final_res").html("<pre>" + JSON.stringify(processedFiles, null, 2) + "</pre>");//nicely formatted JSON
  //$("#final_res").html("<pre>" + FINAL_HTML.replaceAll("{source_data}", JSON.stringify(processedFiles)) + "</pre>");//minified JSON
  downloadHTML(FINAL_HTML.replaceAll("{source_data}", JSON.stringify(processedFiles)));
};

// processImage function
const processImage = async (file, fileData, minProbability, ocrEnabled, addPreview, extractExif, operationPrefix = "") => {
  logMsg("processImage is started. Initial data: ", fileData);
  updateCurrentOperation(`${operationPrefix}Decode Image Data`);

  // Step 1: Load the image into an HTML Image element
  let imageUrl = null;

  if (typeof file == "string") {
    // image is coming from a frame of the video
    imageUrl = file;
  } else {
    // image is coming from file
    imageUrl = URL.createObjectURL(file);
  }
  const img = new Image();
  img.src = imageUrl;
  await img.decode();

  //Extract and store image resolution (width x height)
  fileData.width = img.width;
  fileData.height = img.height;

  updateCurrentOperation(`${operationPrefix}Preview Generation`);
  const previewCurrentImage = convertImageToBase64WithResize(img, previewSize);
  const previewWidth = previewSize;
  $("#current_img").html(`<img src="${previewCurrentImage}" width="${previewWidth}px">`);
  updateCurrentOperation(`${operationPrefix}Preview Generation is finished`);

  // Step 2: Optional save low-resolution preview
  if (addPreview) {
    fileData.previewData = previewCurrentImage;
  }

  // Step 3: Optional EXIF extraction if enabled
  if (extractExif) {
    updateCurrentOperation(`${operationPrefix}EXIF Extraction`);
    const exifData = await extractExifData(file);
    if (exifData) {
      fileData.exifData = exifData;
      if (exifData.dateTaken) {
        fileData.dateCreated = exifData.dateTaken;
      }
    } else {
      fileData.exifData = NOT_AVAILABLE;
    }
  }

  updateCurrentFileInfo(` resolution: ${img.width}x${img.height}.`, true);

  updateCurrentOperation(`${operationPrefix}Objects Detection`);


  // Step 4: Run object detection with selected ML models
  const detectedObjects = await detectObjects(img, minProbability, operationPrefix, fileData.fileName);
  fileData.objectsDetected = detectedObjects;

  // Step 5: Optional OCR if enabled
  if (ocrEnabled) {
    updateCurrentOperation(`${operationPrefix}OCR`);
    const ocrText = await performOCR(img, operationPrefix);
    fileData.ocrText = ocrText;
  }

  // Step 6: Clean up the URL object
  URL.revokeObjectURL(imageUrl);
  updateCurrentOperation(`${operationPrefix}Process Image/Frame is finished`);
  logMsg("processImage is finished. Final data: ", fileData);
};

/**
* fileName - for debug purposes only
*/
async function detectObjects(imageElement, minProbability, operationPrefix, fileName) {

  let tensor = null;
  const predictions = [];
  /*logMsg("load models start");
  for (const loadedModelName of selectedModels) {
    await loadModel(loadedModelName);
  }*/
  /*await Promise.all([
    loadModel("yolov8"),
    //loadModel("mobilenet"),
    loadModel("efficientdet")
  ]);*/
  logMsg("load models finish");
  for (const [modelName, model] of Object.entries(loadedModels)) {
    if (selectedModels.indexOf(modelName) > -1) {
      // start scope. It should help to prevent memory leakage and free up memory at the tf.engine().endScope(); call
      logMsg("***********************************************************************************************");
      debugTFMemUsage("[detectObjects] model loop start");
      //await tf.tidy(async () => {//many errors like this: Cannot return a Promise inside of tidy.
      tfGlobal.engine().startScope();
      //const profile = await tf.engine().profile(async () => {
      //await tf.engine().tidy(() => {
      // tidy only works if there is no await inside or promise returned.
      // Efficientdet required model.executeAsync and tidy cannot be used.
      const modelLabel = modelInfos.find(model => model.name === modelName).label;
      updateCurrentOperation(`${operationPrefix}Objects Detection with model ${modelLabel}`);
      try {
        let imgToObjDetection = await resizeImage(imageElement, maxImageSizeForObjDetection);
        if (modelName == "yolov8") {
          tensor = preProcessImage(imageElement, model);
        } else {
          tensor = tfGlobal.browser.fromPixels(imgToObjDetection).expandDims(0);
        }

        logMsg(`Object detection started with model ${modelName}. First, try to use default TensorFlow Backend: ${tfDefaultBackend}`);
        let prediction;
        if (modelName == "yolov8") {
          prediction = await model.executeAsync(tensor.input);
          //prediction = model.execute(tensor.input);//for compatibility with tidy
          let postProcessedPrediction = await getPredictionDataYOLO(prediction, tensor);
          //let postProcessedPrediction = getPredictionDataYOLO(prediction, tensor);//for compatibility with tidy
          predictions.push(...postProcessedPrediction);
        } else {
          prediction = await model.executeAsync(tensor);
          //prediction = model.execute(tensor);//does not work with efficientdet model. it must be model.executeAsync()
          predictions.push(...formatDetectionResultsED(prediction, minProbability));
        }
        disposeTensorsArray(prediction);
        logMsg(`Object detection finished with model ${modelName}. First, try to use default TensorFlow Backend: ${tfDefaultBackend}`);
        logMsg(`---------------------------Object detection SUCCESS file: ${fileName}-------------------------------`);
      } catch (err) {
        /*if (tfDefaultBackend != tfAlternativeBackend) {
          try {
            let tensor = tfGlobal.browser.fromPixels(imageElement).expandDims(0);
            logMsg(`Object detection started. Default TensorFlow Backend: ${tfDefaultBackend} failed. Try to use alternativeBackend: ${tfAlternativeBackend}`);
            const prediction = await model.executeAsync(tensor);
            logMsg("Object detection finished");
          } catch (errInt) {
            console.error(`Error during object detection on an image with alternative backend ${tfAlternativeBackend}. Error message: `, err.message);
            console.error(`Error during object detection on an image with alternative backend ${tfAlternativeBackend}. Error object: `, err);
          }
        } else {*/
        logMsg(`Error during object detection on an image ${fileName} with default backend ${tfDefaultBackend}. Error message: `, err.message, true);
        logMsg(`Error during object detection on an image ${fileName} with default backend ${tfDefaultBackend}. Error object: `, err, true);
        //}
      } finally {
        // Dispose of the tensor to free GPU memory
        if ((tensor) && (typeof tensor.dispose === "function")) {
          disposeTensorsArray([tensor]);
        } else if ((tensor) && (tensor.input) && (typeof tensor.input.dispose === "function")) {
          //tensor.input.dispose();
          disposeTensorsArray([tensor.input]);
        }
      }
      //});//end of tidy
      //});//end of profile
      tfGlobal.engine().endScope();
      //logMsg("profile: ", profile);
      //hack to free up the memory
      /*logMsg("Try to free up the memory by switching the backend");
      debugTFMemUsage("[detectObjects] before switching backend");
      //await tf.setBackend('cpu');
      //await tf.setBackend('webgl');
      logMsg("Backend switching is done");*/
      //});// end of tf.tidy
      debugTFMemUsage("[detectObjects] before tf.backend().disposeData();");
      //logMsg("before dispose tf.backend().disposed: " + tf.backend().disposed);
      tfGlobal.backend().disposeData();
      //tf.backend().disposeIntermediateTensorInfo();
      //tf.backend().dispose();
      //tf.setBackend('webgl');
      //await tf.ready();
      //logMsg("after dispose tf.backend().disposed: " + tf.backend().disposed);

      debugTFMemUsage("[detectObjects] model loop end");
      logMsg("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^");
    }
  }

  //debugTFMemUsage("[detectObjects] before tf.engine().reset();");
  //await freeAllGPUMemory();

  //dispose all models
  /*logMsg("dispose all models");
  Object.values(loadedModels).forEach(model => {
    if (model && typeof model.dispose === 'function') {
      model.dispose();
    }
  });*/


  /*debugTFMemUsage("[detectObjects] before Tensorflow.js reload within iframe");
  logMsg("before tfIframe.contentWindow.location.reload()");
  tfIframe.contentWindow.location.reload();
  await sleep(1000);
  logMsg("after tfIframe.contentWindow.location.reload()");
  tfGlobal = await waitForTF(tfIframe);//tf
  logMsg("after waitForTF(tfIframe)");
  debugTFMemUsage("[detectObjects] after Tensorflow.js reload within iframe");*/

  // full reset process with reload TFJS and reload models takes 0.4 seconds
  //tf.engine().reset();
  //logMsg("reload Tensorflow.js start");
  //await loadExternalJS(TFJS_URL);
  //logMsg("reload Tensorflow.js finish");
  //debugTFMemUsage("[detectObjects] after tf.engine().reset();");

  // Wait for all predictions to resolve
  //const results = await Promise.all(predictions);

  // Process and filter results for each model using the given minProbability
  /*let predictionsFormattedAndFilterred = predictions.flatMap((prediction, index) =>
    formatDetectionResultsED(prediction, Object.keys(loadedModels)[index], minProbability)
  );
  return predictionsFormattedAndFilterred;*/
  return predictions;
}

const performOCR = async (img, operationPrefix) => {
  //Common languages. TODO: Add multiselect for languages.
  // ara - Arabic
  // rus - Russian
  // ita - Italian
  // dut - Dutch
  // por - Portuguese
  // chi - Chinese
  let maxImgDimention = Math.max(img.width, img.height);
  let imgToOCR = await resizeImage(img, maxImageSizeForOCR);

  // This option enables automatic language detection
  const result = await Tesseract.recognize(imgToOCR, selectedLanguages.join("+"), { // You can add more languages if needed
    logger: (m) => {
      let ocrProgress = (m.progress * 100).toFixed(2);
      logMsg(`[OCR] Progress: ${ocrProgress}%`);
      updateCurrentOperation(`${operationPrefix}OCR Progress: ${ocrProgress}%`);
      updateProcessRemainingTime();
    }
    //,user_defined_dpi: 300 // does not help much with performance. Tried 100 and 300 values
    //,tessedit_char_whitelist: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
  });

  let OCRedText = "";
  if ((result) && (result.data)) {
    OCRedText = result.data.words
      .filter(word => word.confidence >= minOCRProbability)
      .map(word => word.text)
      .join(' ');
  }

  return OCRedText.trim();
};

/**
* Function converts image to base64 encoding like this (red circle image 5x5 px):
* data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==
* if maxDimension argument is provided and it's value > 0, then functions resizes the image as well, that it's max dimention equals to maxDimension argument.
*/
function convertImageToBase64WithResize(img, maxDimension = 0) {
  // will try to create and reuse global canvas/context
  //const canvas = document.createElement("canvas");
  //const context = canvas.getContext("2d");
  logMsg(`convertImageToBase64WithResize started. Original canvas.width: ${canvas.width}, canvas.height: ${canvas.height}`);
  const scaleFactor = maxDimension > 0 ? (maxDimension / Math.max(img.width, img.height)) : 1;
  if (scaleFactor < 1) {
    canvas.width = img.width * scaleFactor;
    canvas.height = img.height * scaleFactor;
  } else {
    canvas.width = img.width;
    canvas.height = img.height;
  }
  //clear the context just in case to clear up GPU memory
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(img, 0, 0, canvas.width, canvas.height);
  logMsg(`convertImageToBase64WithResize finished. Final canvas.width: ${canvas.width}, canvas.height: ${canvas.height}`);
  return canvas.toDataURL("image/jpeg"); // Return the base64-encoded preview
};

/**
* Function resizes image if it is bigger than maxDimension, otherwise returns original image.
* Function also waits until image is resized and loaded.
*/
async function resizeImage(img, maxDimension) {
  const currentMaxDimention = Math.max(img.width, img.height);
  logMsg(`Start Image resizing. Original dimensions: ${img.width}x${img.height}.`);
  if (currentMaxDimention > maxDimension) {
    let resizedImage = new Image();
    resizedImage.src = convertImageToBase64WithResize(img, maxDimension);
    await resizedImage.decode();
    //this is alternative aproach, works better for SVG uimages.
    /*await new Promise(resolve => resizedImage.onload = () => {
      logMsg("Resized Image loaded");
      resolve();
    });*/
    logMsg("Resized Image loaded");
    logMsg(`Image was resized. Original dimensions: ${img.width}x${img.height}. New dimentions: ${resizedImage.width}x${resizedImage.height}`);
    return resizedImage;
  } else {
    return img;
  }
}


const extractExifData = (file) => {
  return new Promise((resolve) => {
    EXIF.getData(file, function() {
      const exifData = {
        cameraManufacturer: EXIF.getTag(this, "Make") || NOT_AVAILABLE,
        cameraModel: EXIF.getTag(this, "Model") || NOT_AVAILABLE,
        dateTaken: (EXIF.getTag(this, "DateTimeOriginal")) ? parseExifImageDate(EXIF.getTag(this, "DateTimeOriginal")) : NOT_AVAILABLE,
        latitude: dmsToDecimal(EXIF.getTag(this, "GPSLatitude")) || NOT_AVAILABLE,
        latitudeRef: EXIF.getTag(this, "GPSLatitudeRef") || NOT_AVAILABLE,
        longitude: dmsToDecimal(EXIF.getTag(this, "GPSLongitude")) || NOT_AVAILABLE,
        longitudeRef: EXIF.getTag(this, "GPSLongitudeRef") || NOT_AVAILABLE,
        altitude: EXIF.getTag(this, "GPSAltitude") || NOT_AVAILABLE,
        altitudeRef: (EXIF.getTag(this, "GPSAltitudeRef") || EXIF.getTag(this, "GPSAltitudeRef") === 0) ? EXIF.getTag(this, "GPSAltitudeRef") : NOT_AVAILABLE,
        exposureTime: EXIF.getTag(this, "ExposureTime") || NOT_AVAILABLE,
        isoSpeed: EXIF.getTag(this, "ISOSpeedRatings") || NOT_AVAILABLE,
        aperture: EXIF.getTag(this, "FNumber") || NOT_AVAILABLE,
        focalLength: EXIF.getTag(this, "FocalLength") || NOT_AVAILABLE,
        closestCities: NOT_AVAILABLE
      };

      if ((exifData.latitude) && (exifData.longitude) && (cities1000)) {
        const closestCities = findClosestCities(exifData.latitude, exifData.longitude, cities1000, 3, 5);
        exifData.closestCities = closestCities;
      }

      resolve(exifData);
    });
  });
};

const processVideo = async (videoFile, fileData, minProbability, videoIndexingInterval, ocrEnabled, addPreview, extractExif) => {
  // Create a video element to load the video file
  logMsg(`Start video processing ${videoFile.name}`);
  const videoElement = document.createElement('video');
  videoElement.src = URL.createObjectURL(videoFile);

  // Initialize the output object
  fileData.framesData = [];
  //delete fileData.ocrText;
  //delete fileData.objectsDetected

  let result = new Promise((resolve, reject) => {
    videoElement.addEventListener('loadeddata', async () => {
      const duration = videoElement.duration;
      const totalFrames = Math.floor(duration * 1000 / videoIndexingInterval);
      const previewFrame = Math.floor(totalFrames / 2);
      for (let i = 0; i <= totalFrames; i++) {
        // Calculate the time to seek to
        const time = i * videoIndexingInterval / 1000;
        logMsg(`Video processing time ${time} sec out of ${duration} sec`);

        // Seek to the specified time
        videoElement.currentTime = time;

        // Wait for the time update event to ensure the frame is loaded
        await new Promise((resolveTime) => {
          videoElement.addEventListener('seeked', async () => {
            // Create a canvas to extract the frame as an image
            //const canvas = document.createElement('canvas');
            canvas.width = videoElement.videoWidth;
            canvas.height = videoElement.videoHeight;
            updateCurrentFileInfo(` resolution: ${videoElement.videoWidth}x${videoElement.videoHeight}.`, true);

            //const ctx = canvas.getContext('2d');

            //clear the context just in case to clear up GPU memory
            context.clearRect(0, 0, canvas.width, canvas.height);
            // Draw the current frame onto the canvas
            context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

            // Convert the canvas to a base64 image data URL
            const frameImage = canvas.toDataURL('image/jpeg');

            // Call processImage with the frame image
            const frameFileData = { ...fileData }; // Create a copy of fileData for this frame
            let videoPreviewEnabled = (addPreview) && (previewFrame == i);
            await processImage(frameImage, frameFileData, minProbability, ocrEnabled, videoPreviewEnabled, false, `[Video (${time}s/${duration}s)] `);

            if ((videoPreviewEnabled) && (frameFileData.previewData)) {
              fileData.previewData = frameFileData.previewData;
            }
            // Format output based on image results
            fileData.framesData.push({
              time: time * 1.0,
              objectsDetected: frameFileData.objectsDetected, // Extracted from processImage
              ocrText: frameFileData.ocrText // Extracted from processImage
            });
            fileData.videoDuration = duration;
            fileData.width = videoElement.videoWidth;
            fileData.height = videoElement.videoHeight;

            resolveTime();
          }, { once: true });
        });
      }

      resolve(fileData); // Resolve the promise with fileData
    });

    // Handle loading errors

  });

  if (extractExif) {
    let exifData = await parseVideoMetadata(videoFile);
    fileData.dateCreated = exifData.dateTaken;
    fileData.exifData = exifData;
  }

  logMsg(`Finish video processing ${videoFile.name}`);
  return result;
};

function logMsg(msg, objectToLog = null, isError = false, forceDebug = false) {
  if ((isDebug) || (forceDebug)) {
    const currDate = getCurrDateAsString();
    if (objectToLog) {
      if (isError) {
        console.error(`[${currDate}] [ERROR] ${msg}`, objectToLog);
      } else {
        console.log(`[${currDate}] [DEBUG] ${msg}`, objectToLog);
      }
    } else {
      if (isError) {
        console.error(`[${currDate}] [ERROR] ${msg}`);
      } else {
        console.log(`[${currDate}] [DEBUG] ${msg}`);
      }
    }
  }
}

function getCurrDateAsString(isISO8601DateFormat = false) {
  const date = new Date();
  const year = date.getFullYear();
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const milliseconds = String(date.getMilliseconds()).padStart(3, '0');

  if (isISO8601DateFormat) {
    return `${year}${month}${day}_${hours}${minutes}${seconds}`;
  } else {
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
  }
}

function updateFinalStatus(filesIndexed) {
  indexingProgress = (1.0 * filesIndexed / fileCount);
  $("#files_indexed").html(filesIndexed);
  $("#indexing_progress").html((indexingProgress * 100.0).toFixed(2) + "%");
  updateProcessRemainingTime();
}
function updateCurrentFileInfo(currentFileInfo, appendString = false) {
  let currentValue = $("#current_indexed_file").html();
  if (currentValue.indexOf(currentFileInfo) < 0) {
    if (appendString) {
      $("#current_indexed_file").append(currentFileInfo);
    } else {
      $("#current_indexed_file").html(currentFileInfo);
    }
  }
  updateProcessRemainingTime();
}

function updateCurrentOperation(operationDesc) {
  $("#current_operation").html(operationDesc);
  updateProcessRemainingTime();
}

function updateProcessRemainingTime() {
  const currentTimeInMS = Date.now();
  const processingTime = currentTimeInMS - startTimeInMS;
  let remainingTime = 0;
  if (indexingProgress > 0) {
    let totalTimeEstimation = Math.round(processingTime / indexingProgress);
    remainingTime = totalTimeEstimation - processingTime;
  }

  $("#processing_time").html(formatTimeInterval(processingTime));
  const remainingTimeString = remainingTime > 0 ? formatTimeInterval(remainingTime) : "N/A";
  $("#remaining_time").html(remainingTimeString);
}

function formatTimeInterval(milliseconds) {
  // Extract milliseconds part
  const ms = milliseconds % 1000;

  // Calculate time components
  const seconds = Math.floor(milliseconds / 1000) % 60;
  const minutes = Math.floor(milliseconds / (1000 * 60)) % 60;
  const hours = Math.floor(milliseconds / (1000 * 60 * 60)) % 24;
  const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));

  // Format components with leading zeros where necessary
  const timeWithoutDays = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
  const formattedTime = days > 0 ? `${days}d ${timeWithoutDays}` : timeWithoutDays;

  return formattedTime;
}

/**
* Sleep functions, which waits for execution for given number of milliseconds.
*/
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


/**
* This function is extracting metadata from video file by using https://unpkg.com/mediainfo.js library
* Documentation for this library is available on this website: https://mediainfo.js.org/
* Used mediaInfo object is created like this:
* MediaInfo.mediaInfoFactory({ format: 'object' }, (mediaInfoInt) => {
*   console.log("mediaInfoInt", mediaInfoInt);
*   mediaInfo = mediaInfoInt;
* });
* format: 'text' can be used, then output format will be like plain preformatted text, not the object with reasonable fields.
*/
async function extractMetadataFromVideo(fileArg, mediaInfo) {
  const fileSize = () => fileArg.size;

  const readChunk = async (chunkSize, startPosition) => {
    const chunk = fileArg.slice(startPosition, startPosition + chunkSize);
    const arrayBuffer = await chunk.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  };

  return await mediaInfo.analyzeData(fileSize, readChunk);
}

async function parseVideoMetadata(videoFile) {
  videoMetadata = await extractMetadataFromVideo(videoFile, mediaInfo);

  let exifData = {
    cameraManufacturer: NOT_AVAILABLE,
    cameraModel: NOT_AVAILABLE,
    dateTaken: NOT_AVAILABLE,
    latitude: NOT_AVAILABLE,
    latitudeRef: NOT_AVAILABLE,
    longitude: NOT_AVAILABLE,
    longitudeRef: NOT_AVAILABLE,
    altitude: NOT_AVAILABLE,
    altitudeRef: NOT_AVAILABLE,
    exposureTime: NOT_AVAILABLE,
    isoSpeed: NOT_AVAILABLE,
    aperture: NOT_AVAILABLE,
    focalLength: NOT_AVAILABLE,
    closestCities: NOT_AVAILABLE
  };
  if (videoMetadata) {

    let dateCreated = videoMetadata?.media?.track[0]?.Encoded_Date;
    dateCreated = (dateCreated) ? new Date(dateCreated) : NOT_AVAILABLE;

    let performer = videoMetadata?.media?.track[0]?.Performer ?? "";//Galaxy S23
    let androidVersion = videoMetadata?.media?.track[0]?.extra?.com_android_version;//14
    let xyzPosition = videoMetadata?.media?.track[0]?.extra?.xyz;//"+52.1486+004.3914/"
    let androidLatitude = extractCoordinates(xyzPosition).latitude;
    let androidLongitude = extractCoordinates(xyzPosition).longitude;

    let appleMake = videoMetadata?.media?.track[0]?.extra?.com_apple_quicktime_make //Apple
    let appleModel = videoMetadata?.media?.track[0]?.extra?.com_apple_quicktime_model //iPhone 13 Pro
    let appleLocation = videoMetadata?.media?.track[0]?.extra?.com_apple_quicktime_location_ISO6709//"+52.1485+004.3914+006.499/"
    let appleLatitude = extractCoordinates(appleLocation).latitude;
    let appleLongitude = extractCoordinates(appleLocation).longitude;

    let androidPerformerAndVersion = androidVersion ? `${performer} Android: ${androidVersion}` : performer;

    let cameraDeviceModel = (androidPerformerAndVersion ?? "").trim() || ((`${appleMake} ${appleModel}`).trim()) || NOT_AVAILABLE;
    let latitude = androidLatitude || appleLatitude || NOT_AVAILABLE;
    let longitude = androidLongitude || appleLongitude || NOT_AVAILABLE;

    if (appleMake) {
      exifData.cameraManufacturer = appleMake;//TODO: for Android devices make mapping like Galaxy S23 -> Samsung to fill manufacturer field.
    }
    exifData.cameraModel = cameraDeviceModel;
    exifData.dateTaken = dateCreated || NOT_AVAILABLE;
    exifData.latitude = latitude;
    exifData.longitude = longitude;
    if ((latitude) && (longitude) && (cities1000)) {
      const closestCities = findClosestCities(latitude, longitude, cities1000, 3, 5);
      exifData.closestCities = closestCities;
    }
  }
  return exifData;
}

/**
* Function parses coordinate from video
*/
function extractCoordinates(input) {
  let result = { latitude: "", longitude: "" };
  if (input) {
    const regex = /([+-]\d+\.\d+)/g; // Matches numbers with signs (+ or -) and decimals
    const matches = input.match(regex);

    if (matches && matches.length >= 2) {
      const [latitude, longitude] = matches.map(Number);
      result = { "latitude": latitude, "longitude": longitude };
    }
  }
  return result;
}

// Haversine formula to calculate the distance between two coordinates
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of Earth in kilometers
  const toRadians = deg => deg * (Math.PI / 180);

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in kilometers
}

function findClosestCities(targetLat, targetLon, cities, count = 3, degreeRange = 5) {
  // Step 1: Filter by longitude +/- 5 degrees
  const lonMin = targetLon - degreeRange;
  const lonMax = targetLon + degreeRange;

  const filteredCities = cities.filter(city => city.lon >= lonMin && city.lon <= lonMax);

  // Step 2: Find the top 3 closest cities by calculating distances
  const distances = filteredCities.map(city => ({
    ...city,
    //distance: parseFloat((haversine(targetLat, targetLon, city.lat, city.lon)).toFixed(3)),
    distance: changeDoublePrecision(haversine(targetLat, targetLon, city.lat, city.lon), 3)
  }));

  // Step 3: Sort the filtered cities by distance and pick the top `count`
  distances.sort((a, b) => a.distance - b.distance);
  return distances.slice(0, count);
}

function dmsToDecimal(dmsArr) {
  let degrees;
  let minutes;
  let seconds;
  if ((dmsArr) && (dmsArr.length == 3)) {
    degrees = dmsArr[0];
    minutes = dmsArr[1];
    seconds = dmsArr[2];
    if ((degrees) && (minutes) && (seconds)) {
      return degrees + (minutes / 60) + (seconds / 3600);
    }
  }
  return "";
}

function formatBytes(bytes) {
  if (bytes === 0) return "0 Bytes";
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = sizes[i];
  const value = (bytes / Math.pow(1024, i)).toFixed(2); // Keep 2 decimal places
  return `${value} ${size}`;
}

// EfficientDet data processing
// Helper function to format detection results for simplicity
function formatDetectionResultsED(prediction, minProbability = 0.8) {
  const boxes = prediction[1].arraySync()[0]; // Bounding boxes this format: Ymin, Xmin, Ymax, Xmax
  const scores = prediction[4].arraySync()[0]; // Confidence scores
  const classes = prediction[0].arraySync()[0].map(index => classLabelsED[index - 1])// Class labels

  //prediction[0].arraySync()//labels index
  //prediction[4].arraySync()//probability
  //prediction[1].arraySync()//boxes

  // Filter and map to result array
  let result = boxes.map((box, index) => ({
    label: classes[index],
    probability: changeDoublePrecision(scores[index], 4),
    box: {
      ymin: changeDoublePrecision(box[0], 4),
      xmin: changeDoublePrecision(box[1], 4),
      ymax: changeDoublePrecision(box[2], 4),
      xmax: changeDoublePrecision(box[3], 4)
    },
    modelName: "EfficientDet"
  })).filter(detection => detection.probability >= (minProbability / 100.0));
  return result;
}

/**
* YOLO image preprocessing.
*/
//async function preProcessImage(image, model) {4
function preProcessImage(image, model) {
  const shape = model.inputs[0].shape.slice(1, 3);
  if (!shape) {
    logMsg("Can't find the input shape in the model", error, true);

  }

  let xRatio = 1, yRatio = 1;

  const [modelInputWidth, modelInputHeight] = shape;

  const input = tfGlobal.tidy(() => {
    //const imgDataObj = imageToImageData(image);
    //const imgDataObj = imageToUintArray(image);
    const tfImg = tfGlobal.browser.fromPixels(image);
    const [height, width] = tfImg.shape;
    const maxSize = Math.max(width, height);
    const paddedImage = tfImg.pad([
      [0, maxSize - height],
      [0, maxSize - width],
      [0, 0],
    ]);

    xRatio = maxSize / width;
    yRatio = maxSize / height;

    return tfGlobal.image
      .resizeBilinear(paddedImage.expandDims(0), [modelInputWidth, modelInputHeight])
      .div(255.0);
  });

  return { input, xRatio, yRatio };
}

async function getPredictionDataYOLO(output, tensor) {
  //function getPredictionDataYOLO(output, tensor) {//for compatibility with tidy
  const prediction = output.transpose([0, 2, 1]);
  const xRatio = tensor.xRatio;
  const yRatio = tensor.yRatio;
  const tensorWidth = tensor.input.shape[1];
  const tensorHeight = tensor.input.shape[2];

  const boxes = tfGlobal.tidy(() => {
    const width = prediction.slice([0, 0, 2], [-1, -1, 1])
    const height = prediction.slice([0, 0, 3], [-1, -1, 1])
    const x1 = tfGlobal.sub(prediction.slice([0, 0, 0], [-1, -1, 1]), tfGlobal.div(width, 2));
    const y1 = tfGlobal.sub(prediction.slice([0, 0, 1], [-1, -1, 1]), tfGlobal.div(height, 2));
    const x2 = tfGlobal.add(x1, width);
    const y2 = tfGlobal.add(y1, height);
    return tfGlobal.concat([x1, y1, x2, y2], 2).squeeze();
  });

  const [scores, classes] = tfGlobal.tidy(() => {
    const scores = (prediction.slice([0, 0, 4], [-1, -1, classLabelsYOLOv8.length])).squeeze();
    return [scores.max(1), scores.argMax(1)];
  });

  debugTFMemUsage("[getPredictionDataYOLO] before dispose1");
  tfGlobal.dispose([prediction]);
  logMsg(`[getPredictionDataYOLO] prediction.isDisposed: ${prediction.isDisposed}`);
  debugTFMemUsage("[getPredictionDataYOLO] after dispose1");

  // Apply Non-Maximum Suppression (NMS) method to remove overlapping boxes with 50% overlap (iouThreshold = 0.5) and keep only boxes with max probability > minProbability / 100.0
  const iouThreshold = 0.5;
  const selectedIndices = await tfGlobal.image.nonMaxSuppressionAsync(boxes, scores, maxOutputSize = 50, iouThreshold, minProbability / 100.0);
  //const selectedIndices = tf.image.nonMaxSuppression(boxes, scores, maxOutputSize = 50, iouThreshold, minProbability / 100.0);//for compatibility with tidy

  // Filter `boxes`, `scores`, and `classes` based on selected indices
  const filteredBoxes = tfGlobal.gather(boxes, selectedIndices);
  const filteredScores = tfGlobal.gather(scores, selectedIndices);
  const filteredClasses = tfGlobal.gather(classes, selectedIndices);

  const boxesArr = filteredBoxes.arraySync();
  const scoresArr = filteredScores.arraySync();
  const classesArr = filteredClasses.arraySync().map(index => classLabelsYOLOv8[index]);

  // Filtering by probability is done by nonMaxSuppressionAsync call above and not needed anymore.
  // Filter and map to result array
  let result = boxesArr.map((box, index) => ({
    label: classesArr[index],
    probability: changeDoublePrecision(scoresArr[index], 4),
    box: {
      ymin: changeDoublePrecision(box[1] * yRatio / tensorHeight, 4),
      xmin: changeDoublePrecision(box[0] * xRatio / tensorWidth, 4),
      ymax: changeDoublePrecision(box[3] * yRatio / tensorHeight, 4),
      xmax: changeDoublePrecision(box[2] * xRatio / tensorWidth, 4)
    },
    modelName: "YOLOv8"
  }));//.filter(detection => detection.probability >= (minProbability / 100.0));

  debugTFMemUsage("[getPredictionDataYOLO] before dispose2");
  tfGlobal.dispose([boxes, scores, classes, selectedIndices, filteredBoxes, filteredScores, filteredClasses]);
  [boxes, scores, classes, selectedIndices, filteredBoxes, filteredScores, filteredClasses].forEach((tensor) => {
    logMsg(`[disposeTensorsArray] tensor.isDisposed: ${tensor.isDisposed}`);
  });
  debugTFMemUsage("[getPredictionDataYOLO] after dispose2");

  return result;
}

// Function to start the keep-alive mechanism
function startKeepAlive() {
  /*if (keepAliveInterval) return; // Prevent multiple intervals
  logMsg('Keep-alive started...');
  keepAliveInterval = setInterval(() => {
    if (!isProcessingOnGoing) {
      logMsg('Keep-alive stopped...');
      clearInterval(keepAliveInterval); // Stop the interval
      keepAliveInterval = null; // Reset the reference
      return;
    }
    logMsg('Keeping tab alive...');
  }, 1000);*/
}

function disposeTensorsArray(tensors) {
  if ((tensors) && (Array.isArray(tensors))) {
    debugTFMemUsage("[disposeTensorsArray] before dispose");
    tfGlobal.dispose(tensors);
    tensors.forEach((tensor) => {
      logMsg(`[disposeTensorsArray] tensor.isDisposed: ${tensor.isDisposed}`);
    });
    debugTFMemUsage("[disposeTensorsArray] after dispose");
    /*tensors.forEach((tensor, index) => {
      if ((tensor) && (typeof tensor.dispose === "function")) {
        tensor.dispose();
      }
    });*/
  } else if ((tensors) && (typeof tensors.dispose === "function")) {
    debugTFMemUsage("[disposeTensorsArray] before dispose");
    tfGlobal.dispose([tensors]);
    logMsg(`[disposeTensorsArray] tensors.isDisposed: ${tensors.isDisposed}`);
    debugTFMemUsage("[disposeTensorsArray] after dispose");
  }

  //alternative option is to use tf.engine().startScope(); and tf.engine().endScope();
}

function debugTFMemUsage(prefix) {
  const numBytesInGPUAllocated = tfGlobal.memory().numBytesInGPUAllocated;
  const numBytesInGPUFree = tfGlobal.memory().numBytesInGPUFree;
  const numBytesInGPU = tfGlobal.memory().numBytesInGPU;
  const numTensors = tfGlobal.memory().numTensors;
  const numDataBuffers = tfGlobal.memory().numDataBuffers;

  logMsg(`[${prefix}] numBytesInGPUAllocated: ${numBytesInGPUAllocated / 1024 / 1024 / 1024}`);
  logMsg(`[${prefix}] numBytesInGPUFree: ${numBytesInGPUFree / 1024 / 1024 / 1024}`);
  logMsg(`[${prefix}] numBytesInGPU: ${numBytesInGPU / 1024 / 1024 / 1024}`);
  logMsg(`[${prefix}] numTensors: ${numTensors}`);
  logMsg(`[${prefix}] numDataBuffers: ${numDataBuffers}`);
}


async function loadExternalJS(url) {
  return new Promise((resolve, reject) => {
    // Remove any existing script with the same src
    document.querySelectorAll(`script[src="${url}"]`).forEach(script => script.remove());

    // Create and append the new script
    const script = document.createElement("script");
    script.src = url;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${url}`));

    document.head.appendChild(script);
  });
}

async function freeAllGPUMemory() {
  let canvasLoc = document.createElement('canvas');
  document.body.appendChild(canvasLoc);  // Attach to the DOM
  let gl = canvasLoc.getContext('webgl');

  // Forcefully lose the context
  const ext = gl.getExtension('WEBGL_lose_context');
  if (ext) {
    console.log("Losing WebGL context...");
    ext.loseContext(); // Releases GPU resources
    await sleep(30000);
    ext.restoreContext(); // Restores WebGL context
  }
  canvasLoc.remove();
  canvasLoc = null;
  gl = null;
}

// Wait until TensorFlow.js is loaded inside the iframe
async function waitForTF(iframe) {
  logMsg("start waiting for TF to be loaded inside iframe");
  if (iframe.contentWindow.tf) {
    logMsg("TF already loaded");
    return iframe.contentWindow.tf;
  } else {
    return new Promise((resolve) => {
      iframe.onload = () => {
        logMsg("TF loaded (iframe.onload event)");
        resolve(iframe.contentWindow.tf);
      };
    });
  }
}


function imageToImageData(imgElement) {
  let canvas = new OffscreenCanvas(imgElement.width, imgElement.height);
  let ctx = canvas.getContext("2d");

  ctx.drawImage(imgElement, 0, 0);
  const imageData = ctx.getImageData(0, 0, imgElement.width, imgElement.height);

  // Clean up
  ctx.clearRect(0, 0, imgElement.width, imgElement.height);
  canvas = null;
  cts = null;
  return imageData; // Directly return the ImageData object
}

function imageToUintArray(imgElement) {
  //const canvas = document.createElement("canvas");
  let canvas = new OffscreenCanvas(imgElement.width, imgElement.height);
  let ctx = canvas.getContext("2d");

  ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);

  // Get ImageData from the canvas
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  // Convert to Uint32Array (each pixel is 4 bytes: RGBA)
  //const uintArray = new Uint32Array(imageData.data.buffer);
  const uintArray = new Uint8Array(imageData.data);

  const result = {
    data: uintArray,
    width: imgElement.width,
    height: imgElement.height
  };

  // Clean up
  ctx.clearRect(0, 0, imgElement.width, imgElement.height);
  canvas = null;
  cts = null;

  return result;
}

function parseExifImageDate(dateString) {
  // Extract date and time components
  const [datePart, timePart] = dateString.split(' ');
  const [year, month, day] = datePart.split(':').map(Number);
  const [hours, minutes, seconds] = timePart.split(':').map(Number);

  // Create a Date object (Note: month is 0-based in JS)
  return new Date(year, month - 1, day, hours, minutes, seconds);
}

function downloadHTML(htmlContent) {
  // Create a Blob with the HTML content
  const blob = new Blob([htmlContent], { type: 'text/html' });

  // Create a link element
  const link = document.createElement('a');

  // Set the download attribute with the desired file name
  link.download = getCurrDateAsString(true) + '_media_archive.html';

  // Create an object URL for the Blob and set it as the href of the link
  link.href = URL.createObjectURL(blob);

  // Append the link to the DOM temporarily (for browsers that require it)
  document.body.appendChild(link);

  // Programmatically click the link to trigger the download
  link.click();

  // Remove the link from the DOM after the download starts
  document.body.removeChild(link);

  // Clean up the object URL after the download is triggered
  URL.revokeObjectURL(link.href);
}

function changeDoublePrecision(numberToChange, numberOfDigitsToKeep) {
  return parseFloat(numberToChange.toFixed(numberOfDigitsToKeep));
}

async function getFileChecksum(file) {
  const arrayBuffer = await file.arrayBuffer(); // Read file as ArrayBuffer
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer); // Compute hash
  const hashArray = Array.from(new Uint8Array(hashBuffer)); // Convert buffer to byte array
  return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join(''); // Convert to hex
}
