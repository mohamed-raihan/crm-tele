import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Upload } from 'lucide-react';
import { downloadCSVTemplate } from '@/lib/csvUtils';
import axiosInstance from './apiconfig/axios';
import { API_URLS } from './apiconfig/api_urls';

export function BulkUploadSection() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Get user role and set button color
  let userRole = "";
  try {
    const userData = typeof window !== 'undefined' ? localStorage.getItem("user_data") : null;
    if (userData) {
      const user = JSON.parse(userData);
      userRole = user.role;
    }
  } catch (e) {
    userRole = "";
  }
  const buttonColorClass = userRole === "Telecaller"
    ? "bg-green-600 hover:bg-green-700"
    : userRole === "Admin"
      ? "bg-blue-600 hover:bg-blue-700"
      : "bg-gray-500 hover:bg-gray-600";

  const handleDownloadTemplate = () => {
    try {
      downloadCSVTemplate();
      toast({
        title: "Template Downloaded",
        description: "CSV template has been downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download template. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        toast({
          title: "Invalid File Type",
          description: "Please select a CSV file",
          variant: "destructive",
        });
        return;
      }
      setFile(file);
      setSelectedFileName(file.name);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No File Selected",
        description: "Please select a CSV file to upload",
        variant: "destructive",
      });
      return;
    }
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await axiosInstance.post(API_URLS.BULK_UPLOAD.POST_CSV, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log(response);
      
      toast({
        title: "Upload Successful",
        description: `Successfully uploaded file: ${file.name}`,
      });
      setFile(null);
      setSelectedFileName('');
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-muted-foreground">BULK UPLOAD</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">
              * Save the file as MS-DOS CSV, Do not Use any Special Characters in File Name.
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              * Please Download Demo File and Upload the data in Same Format
            </p>
            <Button 
              variant="default"
              className={buttonColorClass}
              onClick={handleDownloadTemplate}
            >
              Download Template
            </Button>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Upload File</label>
            <div className="flex gap-2">
              <Input 
                placeholder={selectedFileName || "Upload File"} 
                className="flex-1" 
                readOnly 
                value={selectedFileName}
              />
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                id="csv-upload"
              />
              <Button 
                variant="default"
                className={buttonColorClass}
                onClick={() => document.getElementById('csv-upload')?.click()}
              >
                Select File
              </Button>
            </div>
            {selectedFileName && (
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                className={`w-full mt-4 ${buttonColorClass}`}
              >
                <Upload className="w-4 h-4 mr-2" />
                {isUploading ? 'Uploading...' : 'Upload CSV'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}