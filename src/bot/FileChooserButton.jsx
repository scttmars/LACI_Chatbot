import React, { useEffect, useState } from 'react';

/**
 * Function used to generate a file chooser for selecting a project path.
 */
const FileChooser = () => {
  return (
    <div>
    <input type="file" id="myfile" name="myfile"></input>
    </div>
  );
};

export default FileChooser;