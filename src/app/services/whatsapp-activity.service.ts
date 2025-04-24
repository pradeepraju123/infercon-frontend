import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class WhatsappActivityService {

  
  private apiUrl = 'https://api.inferconautomation.com/api/v1/contact';
  private excelUrl='https://api.inferconautomation.com/api/v1/users/getall';
  private excelUrl1='https://api.inferconautomation.com/api/v1/users/bulkwhatsmes';


  constructor(
    private http: HttpClient
  ) {}
  
  // getAllContact(data: any): Observable<any> {
  //   const token = sessionStorage.getItem('authToken');

  //   if (token) {
  //     const headers = new HttpHeaders({
  //       'Authorization': 'Bearer ' + token
  //         });
  //   return this.http.post(`${this.excelUrl}/get`, data, { headers });
  // } else {
 
  //    return throwError('No authentication token found'); 
  //   }
  // }

  // sendmessage_filtercontact(data: any): Observable<any> {
  //   const token = sessionStorage.getItem('authToken');

  //   if (token) {
  //     const headers = new HttpHeaders({
  //       'Authorization': 'Bearer ' + token
  //         });
  //   return this.http.post(`${this.excelUrl1}/get`, data, { headers });
  // } else {
 
  //    return throwError('No authentication token found'); 
  //   }
  // }
  sendmessage_filtercontact(data: any): Observable<any> {
    const url = `${this.excelUrl1}`;
    return this.http.post(url,data);

  }

  getAllContact(): Observable<any> {
    const url = `${this.excelUrl}`;

      
    return this.http.get(url);
  
 
  }

  
}
