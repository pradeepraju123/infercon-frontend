import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ContactService {

  private apiUrl = 'https://api.inferconautomation.com/api/v1/contact';

  constructor(
    private http: HttpClient
  ) {}
  createContact(data: any): Observable<any> {
       const url = `${this.apiUrl}`;
       return this.http.post(url, data);
  }
  getContactById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }
  getAllContact(params: any): Observable<any> {
    const token = sessionStorage.getItem('authToken'); // Get the token from sessionStorage

    if (token) {
      //   // Set the headers with the bearer token
      const headers = new HttpHeaders({
        'Authorization': 'Bearer ' + token // Include the token in the request headers
          });
    return this.http.post(`${this.apiUrl}/get`, { params }, { headers });
  } else {
  //   // Handle the case where there's no token (e.g., user is not authenticated)
  //   // You can choose to return an error Observable or handle it in a way that suits your application.
     return throwError('No authentication token found'); // For example, using throwError from RxJS
    }
  }
  updateContact(_id: string, data: any): Observable<any> {
    const token = sessionStorage.getItem('authToken'); // Get the token from sessionStorage
  
      if (token) {
      //   // Set the headers with the bearer token
      const headers = new HttpHeaders({
        'Authorization': 'Bearer ' + token // Include the token in the request headers
         });
    
         
         const url = `${this.apiUrl}/${_id}`;
         return this.http.post(url, data, { headers });
       } else {
      //   // Handle the case where there's no token (e.g., user is not authenticated)
      //   // You can choose to return an error Observable or handle it in a way that suits your application.
         return throwError('No authentication token found'); // For example, using throwError from RxJS
       }
    
  }
}
