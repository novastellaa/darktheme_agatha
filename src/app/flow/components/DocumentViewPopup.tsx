'use client'

import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Download, FileText, Calendar, Loader2 } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Document {
  id: number;
  name: string;
  created: string;
  file: string;
}

interface DocumentViewPopupProps {
  isOpen: boolean;
  onClose: () => void;
  user: any | null;
}

const DocumentViewPopup: React.FC<DocumentViewPopupProps> = ({ isOpen, onClose, user }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && user) {
      fetchDocuments();
    }
  }, [isOpen, user]);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/get-documents?userId=${user?.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      const data = await response.json();
      setDocuments(data.map((doc: any) => ({
        id: doc.id,
        name: doc.fileName,
        created: format(new Date(doc.created), 'MMM dd, yyyy'),
        file: doc.file
      })));
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Error",
        description: "Failed to fetch documents. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  
  const downloadFile = (base64: string | undefined, fileName: string) => {
    console.log('testtting', documents);
    if (!base64) {
      console.error('Base64 data is undefined or null');
      toast({
        title: "Error",
        description: "File data is missing. Please try again or contact support.",
        variant: "destructive",
      });
      return;
    }

    try {
      let binaryString;
      if (base64.includes(',')) {
        // If the base64 string includes a comma, it's likely a data URL
        binaryString = atob(base64.split(',')[1]);
      } else {
        // Otherwise, try to decode it directly
        binaryString = atob(base64);
      }

      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: `File "${fileName}" downloaded successfully.`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Error",
        description: "Failed to download the file. Please try again.",
        variant: "destructive",
      });
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-2xl font-bold">Document List</DialogTitle>
          <DialogDescription>
            View and download your uploaded documents
          </DialogDescription>
        </DialogHeader>
        <Card className="m-6 mt-2">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[49px]">No</TableHead>
                  <TableHead className='w-[243px]'>File Name</TableHead>
                  <TableHead className='w-[150px]'>Created</TableHead>
                  <TableHead className='w-[150px]'>Action</TableHead>
                </TableRow>
              </TableHeader>
            </Table>
            <ScrollArea className="h-[50vh] w-full">
              <Table>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell><Skeleton className="h-6 w-10" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-full" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-24 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : documents.length > 0 ? (
                    documents.map((doc, index) => (
                      <TableRow key={doc.id} className="hover:bg-gray-100 transition-colors">
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell className="flex items-center w-[243px]">
                          <FileText className="mr-2 h-4 w-4 text-blue-500" />
                          <span className="font-medium">{doc.name}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-normal">
                            <Calendar className="mr-2 h-3 w-3" />
                            {doc.created}
                          </Badge>
                        </TableCell>
                        <TableCell >
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadFile(doc.file, doc.name)}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        No documents found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DocumentViewPopup;