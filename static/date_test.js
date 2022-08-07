// // https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885__480.jpg

// function onStartedDownload(id) {
//     console.log(`Started downloading: ${id}`);
//   }
  
//   function onFailed(error) {
//     console.log(`Download failed: ${error}`);
//   }
  
//   let downloadUrl = "https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885__480.jpg";
  
//   let downloading = browser.downloads.download({
//     url : downloadUrl,
//     filename : 'my-image-again.png',
//     conflictAction : 'uniquify'
//   });
  
//   downloading.then(onStartedDownload, onFailed);
  

var formdata = new FormData();
formdata.append('blobFile',blob);

fetch('http://localhost:8000/uploader', {
  method: "POST",
  body: formdata
}).then(res => res.json()).then(()=>{
  alert("stream file uploaded successfully")
})