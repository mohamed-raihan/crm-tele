// CSV Template and Upload Utilities

export interface LeadTemplateData {
    ID: string;
    Name: string;
    Phone: string;
    Service: string;
    'Preferred Course': string;
    'Created by': string;
    Branch: string;
    'Meta Ad': string;
    'Assigned to': string;
  }
  
  export const CSV_HEADERS: (keyof LeadTemplateData)[] = [
    'ID',
    'Name', 
    'Phone',
    'Service',
    'Preferred Course',
    'Created by',
    'Branch',
    'Meta Ad',
    'Assigned to'
  ];
  
  export const SAMPLE_DATA: LeadTemplateData[] = [
    {
      ID: '5',
      Name: 'theertha',
      Phone: '9567343089',
      Service: '',
      'Preferred Course': '',
      'Created by': 'Admin',
      Branch: 'vazhakala',
      'Meta Ad': '',
      'Assigned to': 'Raihan'
    }
  ];
  
  export function downloadCSVTemplate() {
    const csvContent = [
      CSV_HEADERS.join(','),
      ...SAMPLE_DATA.map(row => 
        CSV_HEADERS.map(header => `"${row[header] || ''}"`).join(',')
      ),
      // Add some empty rows for users to fill
      ...Array(5).fill(CSV_HEADERS.map(() => '""').join(','))
    ].join('\n');
  
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'leads_template.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  export function parseCSVFile(file: File): Promise<LeadTemplateData[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const csv = event.target?.result as string;
          const lines = csv.split('\n').filter(line => line.trim());
          
          if (lines.length < 2) {
            reject(new Error('CSV file must have headers and at least one data row'));
            return;
          }
  
          const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
          const dataLines = lines.slice(1);
          
          const parsedData: LeadTemplateData[] = dataLines.map((line, index) => {
            const values = line.split(',').map(v => v.replace(/"/g, '').trim());
            const rowData = {} as LeadTemplateData;
            
            headers.forEach((header, i) => {
              if (CSV_HEADERS.includes(header as keyof LeadTemplateData)) {
                (rowData as any)[header] = values[i] || '';
              }
            });
            
            return rowData;
          }).filter(row => row.Name && row.Phone); // Filter out empty rows
          
          resolve(parsedData);
        } catch (error) {
          reject(new Error('Failed to parse CSV file'));
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }