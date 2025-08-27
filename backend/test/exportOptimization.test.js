// backend/test/exportOptimization.test.js
// Test script for optimizing export of 5000 records

const { performance } = require('perf_hooks');
const fs = require('fs').promises;
const path = require('path');
const { createObjectCsvWriter } = require('csv-writer');
const ExcelJS = require('exceljs');

/**
 * Generate test data for export testing
 * @param {number} count - Number of records to generate
 * @returns {Array} Array of test records
 */
const generateTestData = (count) => {
  const records = [];
  
  for (let i = 0; i < count; i++) {
    records.push({
      id: i + 1,
      businessName: `Business ${i + 1}`,
      contactPerson: `Contact Person ${i + 1}`,
      email: `contact${i + 1}@business${i + 1}.com`,
      phone: `+1-555-${String(i + 1000).padStart(4, '0')}`,
      address: `${i + 1} Main Street, City ${i % 100}, State ${String.fromCharCode(65 + (i % 26))} ${10000 + (i % 1000)}`,
      website: `https://www.business${i + 1}.com`,
      confidence: Math.random(),
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000).toISOString()
    });
  }
  
  return records;
};

/**
 * Test CSV export performance
 * @param {Array} records - Records to export
 * @returns {Object} Performance metrics
 */
const testCsvExport = async (records) => {
  const startTime = performance.now();
  
  try {
    // Create CSV writer
    const csvWriter = createObjectCsvWriter({
      path: path.join(__dirname, 'test-data', 'test-export.csv'),
      header: [
        { id: 'id', title: 'ID' },
        { id: 'businessName', title: 'Business Name' },
        { id: 'contactPerson', title: 'Contact Person' },
        { id: 'email', title: 'Email' },
        { id: 'phone', title: 'Phone' },
        { id: 'address', title: 'Address' },
        { id: 'website', title: 'Website' },
        { id: 'confidence', title: 'Confidence' },
        { id: 'createdAt', title: 'Created At' }
      ]
    });
    
    // Write records to CSV
    await csvWriter.writeRecords(records);
    
    const endTime = performance.now();
    
    // Get file size
    const stats = await fs.stat(path.join(__dirname, 'test-data', 'test-export.csv'));
    const fileSize = stats.size;
    
    return {
      success: true,
      duration: endTime - startTime,
      fileSize: fileSize,
      recordCount: records.length,
      format: 'CSV'
    };
  } catch (error) {
    const endTime = performance.now();
    return {
      success: false,
      duration: endTime - startTime,
      error: error.message,
      recordCount: records.length,
      format: 'CSV'
    };
  }
};

/**
 * Test Excel export performance
 * @param {Array} records - Records to export
 * @returns {Object} Performance metrics
 */
const testExcelExport = async (records) => {
  const startTime = performance.now();
  
  try {
    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Business Records');
    
    // Define columns
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Business Name', key: 'businessName', width: 30 },
      { header: 'Contact Person', key: 'contactPerson', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Phone', key: 'phone', width: 20 },
      { header: 'Address', key: 'address', width: 50 },
      { header: 'Website', key: 'website', width: 35 },
      { header: 'Confidence', key: 'confidence', width: 15 },
      { header: 'Created At', key: 'createdAt', width: 25 }
    ];
    
    // Add rows
    worksheet.addRows(records);
    
    // Save workbook
    await workbook.xlsx.writeFile(path.join(__dirname, 'test-data', 'test-export.xlsx'));
    
    const endTime = performance.now();
    
    // Get file size
    const stats = await fs.stat(path.join(__dirname, 'test-data', 'test-export.xlsx'));
    const fileSize = stats.size;
    
    return {
      success: true,
      duration: endTime - startTime,
      fileSize: fileSize,
      recordCount: records.length,
      format: 'Excel'
    };
  } catch (error) {
    const endTime = performance.now();
    return {
      success: false,
      duration: endTime - startTime,
      error: error.message,
      recordCount: records.length,
      format: 'Excel'
    };
  }
};

/**
 * Run export optimization tests
 */
const runExportOptimizationTests = async () => {
  console.log('Starting export optimization tests...');
  
  // Create test data directory
  await fs.mkdir(path.join(__dirname, 'test-data'), { recursive: true });
  
  // Test with different record counts
  const testSizes = [100, 500, 1000, 2000, 5000];
  const results = [];
  
  for (const size of testSizes) {
    console.log(`\nTesting export of ${size} records...`);
    
    // Generate test data
    const testData = generateTestData(size);
    
    // Test CSV export
    console.log('  Testing CSV export...');
    const csvResult = await testCsvExport(testData);
    results.push(csvResult);
    
    // Test Excel export
    console.log('  Testing Excel export...');
    const excelResult = await testExcelExport(testData);
    results.push(excelResult);
    
    // Log results
    console.log(`  CSV: ${csvResult.success ? 'Success' : 'Failed'} in ${csvResult.duration.toFixed(2)}ms`);
    console.log(`  Excel: ${excelResult.success ? 'Success' : 'Failed'} in ${excelResult.duration.toFixed(2)}ms`);
  }
  
  // Generate report
  console.log('\n=== EXPORT OPTIMIZATION TEST RESULTS ===');
  console.log('Format\t\tRecords\t\tDuration (ms)\tFile Size (bytes)\tStatus');
  console.log('--------------------------------------------------------------------');
  
  for (const result of results) {
    console.log(
      `${result.format}\t\t${result.recordCount}\t\t${result.duration.toFixed(2)}\t\t${result.fileSize || 'N/A'}\t\t${result.success ? 'Success' : 'Failed'}`
    );
  }
  
  // Save results to file
  const resultsPath = path.join(__dirname, 'test-data', 'export-test-results.json');
  await fs.writeFile(resultsPath, JSON.stringify(results, null, 2));
  console.log(`\nResults saved to ${resultsPath}`);
  
  // Optimization recommendations
  console.log('\n=== OPTIMIZATION RECOMMENDATIONS ===');
  console.log('1. For large exports (>1000 records), consider streaming data to avoid memory issues');
  console.log('2. Implement pagination for exports to reduce memory usage');
  console.log('3. Use compression for large CSV files');
  console.log('4. For Excel files, consider using xlsx library instead of ExcelJS for better performance with large datasets');
  console.log('5. Implement background job processing for exports of >5000 records');
  console.log('6. Cache export results for repeated requests with same parameters');
  console.log('7. Monitor memory usage during export operations');
  console.log('8. Implement progress tracking for long-running export operations');
  
  console.log('\nExport optimization tests completed.');
};

// Run tests if script is executed directly
if (require.main === module) {
  runExportOptimizationTests().catch(console.error);
}

module.exports = {
  generateTestData,
  testCsvExport,
  testExcelExport,
  runExportOptimizationTests
};