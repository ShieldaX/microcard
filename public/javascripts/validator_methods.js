// Accept a file size from a file input based on a required limitation
$.validator.addMethod("filesize", function (value, element, param) {
  // Bytes only accepts integer
  param = typeof param === 'string' ? parseInt(param, 10) : Math.floor(param);

  // Element is optional
  if (this.optional(element)) {
    return true;
  }

  if ($(element).attr("type") === "file") {
    // Check if the element has a FileList before checking each file
    if (element.files && element.files.length) {
      for (i = 0; i < element.files.length; i++) {
        file = element.files[i];

        // Compare the size of loaded file with given size param
        if (file.size && file.size > param) {
          return false;
        }
      }
    }
  }

  // Either return true because we've validated each file, or because the
  // browser does not support element.files and the FileList feature
  return true;
}, $.validator.format("Please choose a file with a valid size."));