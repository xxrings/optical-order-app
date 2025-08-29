import { excelParser } from './excelParser';

export async function testFrameData() {
  try {
    console.log('Testing frame data parsing...');
    
         // Load the workbook
     await excelParser.loadWorkbook('/Optical_Catalog_Master_FRESH.xlsx');
    
    // Parse the catalog
    const catalog = excelParser.parseCatalog();
    
    console.log('Frame data test results:');
    console.log('Total frames:', catalog.frames.length);
    
    if (catalog.frames.length > 0) {
      const firstFrame = catalog.frames[0];
      console.log('First frame:', {
        FRAME_ID: firstFrame.FRAME_ID,
        NAME: firstFrame.NAME,
        EYE_SIZE: firstFrame.EYE_SIZE,
        COLOR: firstFrame.COLOR,
        SKU: firstFrame.SKU
      });
      
      // Check for frames with SKU
      const framesWithSku = catalog.frames.filter(f => f.SKU);
      console.log('Frames with SKU:', framesWithSku.length);
      
      if (framesWithSku.length > 0) {
        console.log('Sample frames with SKU:');
        framesWithSku.slice(0, 3).forEach((frame, index) => {
          console.log(`Frame ${index + 1}:`, {
            FRAME_ID: frame.FRAME_ID,
            NAME: frame.NAME,
            EYE_SIZE: frame.EYE_SIZE,
            COLOR: frame.COLOR,
            SKU: frame.SKU
          });
        });
      }
    }
    
    return catalog.frames;
  } catch (error) {
    console.error('Error testing frame data:', error);
    return [];
  }
}
