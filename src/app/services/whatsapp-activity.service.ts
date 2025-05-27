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
  //private excelUrl='http://localhost:8081/api/v1/users/getall';
 // private excelUrl1='http://localhost:8081/api/v1/users/bulkwhatsmes';
   private excelUrl_contacts='https://api.inferconautomation.com/api/v1/users/bulkupload';
   private filter_contact='https://api.inferconautomation.com/api/v1/users/filtercontact';
    //private filter_contact='http://localhost:8081/api/v1/users/filtercontact';



  constructor(
    private http: HttpClient
  ) {}
  
  // uploaduser(data: any): Observable<any> {
  //   // const token = sessionStorage.getItem('authToken');
  //   const url = `${this.excelUrl_contacts}`;
  //     return this.http.post(url, data,);
   
   
  // }
  
  uploaduser(data: any): Observable<any> {
    const token = sessionStorage.getItem('authToken');
    const url = `${this.excelUrl_contacts}`;
    if(token)
    {
      const headers = new HttpHeaders({
        'Authorization': 'Bearer ' + token // Include the token in the request headers
          });
      return this.http.post(url, data, { headers });
    }
    else{
      return throwError('No authentication token found'); 
    }
   
   }
   sendmessage_filtercontact(data: any): Observable<any> {
    const token = sessionStorage.getItem('authToken');

    if (token) {
      const headers = new HttpHeaders({
        'Authorization': 'Bearer ' + token
          });
    return this.http.post(`${this.filter_contact}`, data, { headers });
  } else {
 
     return throwError('No authentication token found'); 
    }
  }

  sendcontect_template(data: any): Observable<any> {
    const token = sessionStorage.getItem('authToken');

    if (token) {
      const headers = new HttpHeaders({
        'Authorization': 'Bearer ' + token
          });
    return this.http.post(`${this.excelUrl1}`, data, { headers });
  } else {
 
     return throwError('No authentication token found'); 
    }
    
    //return this.http.post(`${this.excelUrl1}`, data);
  }
  

  // sendmessage_filtercontact(data: any): Observable<any> {

  //   return this.http.post(`${this.filter_contact}`, data);

  // }
  
  // sendmessage_filtercontact(data: any): Observable<any> {
  //   const url = `${this.excelUrl1}`;
  //   return this.http.post(url,data);

  // }

  

  
}
