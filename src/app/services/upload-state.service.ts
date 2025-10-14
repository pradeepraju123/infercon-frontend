// upload-state.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ProcessedContact {
  fullname: string;
  email: string;
  student_code?: string;
  course_name?: string;
  staff_name?: string;
  // add other fields as needed
}

@Injectable({
  providedIn: 'root'
})
export class UploadStateService {
  private processedDataSubject = new BehaviorSubject<ProcessedContact[]>([]);
  processedData$ = this.processedDataSubject.asObservable();

  private uploadResultSubject = new BehaviorSubject<any>(null);
  uploadResult$ = this.uploadResultSubject.asObservable();

  setProcessedData(data: ProcessedContact[], uploadResult: any) {
    this.processedDataSubject.next(data);
    this.uploadResultSubject.next(uploadResult);

    localStorage.setItem('processedData', JSON.stringify(data));
    localStorage.setItem('uploadResult', JSON.stringify(uploadResult));
  }

  loadPersistedData() {
    const data = JSON.parse(localStorage.getItem('processedData') || '[]');
    const result = JSON.parse(localStorage.getItem('uploadResult') || 'null');
    this.processedDataSubject.next(data);
    this.uploadResultSubject.next(result);
  }

  // 👇 Add these getter methods
  getProcessedData(): ProcessedContact[] {
    return this.processedDataSubject.getValue();
  }

  getUploadResult(): any {
    return this.uploadResultSubject.getValue();
  }

  clearData() {
    this.processedDataSubject.next([]);
    this.uploadResultSubject.next(null);
    localStorage.removeItem('processedData');
    localStorage.removeItem('uploadResult');
  }
}