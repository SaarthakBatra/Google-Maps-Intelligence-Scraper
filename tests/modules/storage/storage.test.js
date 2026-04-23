import fs from 'fs/promises';
import path from 'path';
import { saveResults } from '../../../src/modules/storage/index.js';
import { saveJson } from '../../../src/modules/storage/save-json.js';
import { saveCsv } from '../../../src/modules/storage/save-csv.js';

describe('Storage Module', () => {
  const outputDir = 'output';
  const testData = [
    { Name: 'Test Business 1', Address: '123 Fake St', Rating: 4.5 },
    { Name: 'Test Business 2', Address: '456 Mock Ave', Rating: 3.8 }
  ];

  /*
   * Helper to clean up output directory before/after tests
   * We use a try/catch because the directory might not exist
   */
  const cleanOutput = async () => {
    try {
      const files = await fs.readdir(outputDir);
      for (const file of files) {
        if (file.startsWith('test_') || file.startsWith('businesses_')) {
          await fs.unlink(path.join(outputDir, file));
        }
      }
    } catch (e) {
      // Ignore if dir doesn't exist
    }
  };

  beforeAll(async () => {
    await fs.mkdir(outputDir, { recursive: true });
  });

  afterAll(async () => {
    await cleanOutput();
  });

  test('saveJson should create a valid JSON file', async () => {
    const filename = 'test_json';
    const filePath = await saveJson(testData, filename);
    
    expect(filePath).toContain('test_json.json');
    
    const content = await fs.readFile(filePath, 'utf-8');
    const parsed = JSON.parse(content);
    expect(parsed).toEqual(testData);
  });

  test('saveCsv should create a valid CSV file', async () => {
    const filename = 'test_csv';
    const filePath = await saveCsv(testData, filename);
    
    expect(filePath).toContain('test_csv.csv');
    
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.trim().split('\n');
    
    // Header + 2 data lines
    expect(lines.length).toBe(3);
    expect(lines[0]).toBe('Name,Address,Rating');
    expect(lines[1]).toContain('Test Business 1');
  });

  test('saveCsv should handle special characters', async () => {
    const dataWithSpecialChars = [
      { Name: 'Business, "Inc"', Address: 'Line 1\nLine 2', Note: 'Normal' }
    ];
    
    const filename = 'test_csv_special';
    await saveCsv(dataWithSpecialChars, filename);
    const filePath = path.join(outputDir, `${filename}.csv`);
    
    const content = await fs.readFile(filePath, 'utf-8');
    // Expect quotes around fields with special chars
    expect(content).toContain('"Business, ""Inc"""');
    expect(content).toContain('"Line 1\nLine 2"');
  });

  test('saveResults should save both formats with timestamp', async () => {
    const result = await saveResults(testData);
    
    expect(result.count).toBe(2);
    expect(result.files.length).toBeGreaterThanOrEqual(2); // JSON and CSV
    
    // Check if files actually exist
    for (const file of result.files) {
      const stats = await fs.stat(file);
      expect(stats.isFile()).toBe(true);
    }
  });
});
