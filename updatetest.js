var db = new PouchDB('sample');

document.addEventListener('DOMContentLoaded', function () {
  var inputFile = document.querySelector('#inputFile');
  var imageMetaData = document.querySelector('#img_meta_data');
  var getFile;

  function fileUpload() {
      getFile = inputFile.files[0];
      // getFile is now a Blob

      // Destroy the database before doing anything, because I want 
      // you to see the same thing if you reload.
      // Ignore the man behind the curtain!
        // IMPORTANT CODE STARTS HERE
        //
        db.put({
          _id: 'image', 
          _attachments: {
            "file": {
              type: getFile.type,
              data: getFile
            }
          }
        }).then(function () {
          return db.getAttachment('image', 'file');
        }).then(function (blob) {
          var url = URL.createObjectURL(blob);
          var img = document.createElement('img');
          img.src = url;
          document.body.appendChild(img);

          var fileSize = JSON.stringify(Math.floor(blob.size/1024));
          var contentType = JSON.stringify(blob.type);

          imageMetaData.innerText = 'Filesize: ' + fileSize + 'KB, Content-Type: ' + contentType;
        }).catch(function (err) {
          console.log(err);
        });
        //
        // IMPORTANT CODE ENDS HERE
        //
  }

  // wait for change, then call the function
  inputFile.addEventListener('change', fileUpload, false);
});