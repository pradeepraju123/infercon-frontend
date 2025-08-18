import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root'
})
export class InstallmentService {

  private baseUrl = 'http://localhost:8081/api/v1/installments';

  constructor(private http: HttpClient) {}

  updateInstallments(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/updateInstallments`, data);
  }

  payInstallment(userId: string, installmentNumber: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/payInstallment`,  { id: userId, installmentNumber });
  }
}
