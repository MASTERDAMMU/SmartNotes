// src/utils/fileUtils.js
export const saveToFile = async (data, fileName) => {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: fileName,
        types: [{
          description: 'Mind Map Data',
          accept: {
            'application/json': ['.json'],
          },
        }],
      });
  
      const writable = await handle.createWritable();
      await writable.write(JSON.stringify(data, null, 2));
      await writable.close();
  
      return true;
    } catch (err) {
      console.error('Error saving file:', err);
      return false;
    }
  };
  
  export const loadFromFile = async () => {
    try {
      const [handle] = await window.showOpenFilePicker({
        types: [{
          description: 'Mind Map Data',
          accept: {
            'application/json': ['.json'],
          },
        }],
        multiple: false,
      });
  
      const file = await handle.getFile();
      const contents = await file.text();
      return JSON.parse(contents);
    } catch (err) {
      console.error('Error loading file:', err);
      return null;
    }
  };
  
  export const exportAsPNG = async (svgElement, fileName = 'mindmap.png') => {
    try {
      // Create a canvas element
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Get SVG data
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const DOMURL = window.URL || window.webkitURL || window;
      const img = new Image();
      const svgUrl = DOMURL.createObjectURL(svgBlob);
  
      return new Promise((resolve, reject) => {
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          DOMURL.revokeObjectURL(svgUrl);
  
          canvas.toBlob(async (blob) => {
            try {
              const handle = await window.showSaveFilePicker({
                suggestedName: fileName,
                types: [{
                  description: 'PNG Image',
                  accept: {
                    'image/png': ['.png'],
                  },
                }],
              });
  
              const writable = await handle.createWritable();
              await writable.write(blob);
              await writable.close();
              resolve(true);
            } catch (err) {
              reject(err);
            }
          }, 'image/png');
        };
        img.src = svgUrl;
      });
    } catch (err) {
      console.error('Error exporting as PNG:', err);
      return false;
    }
  };