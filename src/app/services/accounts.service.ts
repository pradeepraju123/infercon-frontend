import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class AccountsService {

private apiUrl = 'http://localhost:8081/api/v1/installments';

  constructor(private http: HttpClient) {}
  getInstallmentDetails(contactId: string): Observable<any> {
    
  return this.http.get(`${this.apiUrl}/details/${contactId}`);
}
setupInstallmentPlan(data: any): Observable<any> {
  const token = sessionStorage.getItem('authToken'); // ← Change to sessionStorage
  if (token) {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${this.apiUrl}/setup`, data, { headers });
  } else {
    return throwError(() => new Error('No authentication token found'));
  }
}
// In registration.service.ts
payInstallment(paymentData: any): Observable<any> {
  return this.http.post(`${this.apiUrl}/pay`, paymentData);
}
// In registration.service.ts
getAllAccounts(params?: any): Observable<any> {
  const token = sessionStorage.getItem('authToken');
  if(token){
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + token
    });
  return this.http.get(`${this.apiUrl}/all`, { params,headers});
  }
else {
  
    return throwError(() => new Error('No authentication token found'));
  }
}
setupManualInstallmentPlan(data: any): Observable<any> {
  const token = sessionStorage.getItem('authToken'); // ← Change to sessionStorage
  if (token) {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${this.apiUrl}/manual-setup`, data, { headers });
  } else {
    return throwError(() => new Error('No authentication token found'));
  }
}

updateInstallmentStatus(payload: any) {
  const token = sessionStorage.getItem('authToken'); // ← Change to sessionStorage
  if (token) {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.post<any>(`${this.apiUrl}/update-status`, payload);
} else {
    return throwError(() => new Error('No authentication token found'));
  }
}

}
