const fs = require('fs');

const deleteFile = (filePath) => {
    fs.unlink(filePath, (err) => {
        if(err) {
            throw (err);  // When this error is thrown, our default express error handler is invoked to proceed with that error
        }
    })
}

exports.deleteFile = deleteFile;