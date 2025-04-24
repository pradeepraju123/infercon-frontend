import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ContactService {

  private apiUrl = 'https://api.inferconautomation.com/api/v1/contact';
  private excelUrl='http://localhost:8081/api/v1/users/bulkpload';

  constructor(
    private http: HttpClient
  ) {}
  createContact(data: any): Observable<any> {
       const url = `${this.apiUrl}`;
       
       return this.http.post(url, data);
  }

  uploaduser(data: any): Observable<any> {
    const token = sessionStorage.getItem('authToken');
    const url = `${this.excelUrl}`;
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
  getContactById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }
  getAllContact(data: any): Observable<any> {
    const token = sessionStorage.getItem('authToken'); // Get the token from sessionStorage

    if (token) {
      //   // Set the headers with the bearer token
      const headers = new HttpHeaders({
        'Authorization': 'Bearer ' + token // Include the token in the request headers
          });
    return this.http.post(`${this.apiUrl}/get`, data, { headers });
  } else {
  //   // Handle the case where there's no token (e.g., user is not authenticated)
  //   // You can choose to return an error Observable or handle it in a way that suits your application.
     return throwError('No authentication token found'); // For example, using throwError from RxJS
    }
  }

  downloadContact(data: any): Observable<any> {
    const token = sessionStorage.getItem('authToken'); // Get the token from sessionStorage

    if (token) {
      //   // Set the headers with the bearer token
      const headers = new HttpHeaders({
        'Authorization': 'Bearer ' + token // Include the token in the request headers
          });
    return this.http.post(`${this.apiUrl}/download`, data, { headers });
  } else {
  //   // Handle the case where there's no token (e.g., user is not authenticated)
  //   // You can choose to return an error Observable or handle it in a way that suits your application.
     return throwError('No authentication token found'); // For example, using throwError from RxJS
    }
  }
  updateContactBulk(ids: string[], updateData: any) {
    const token = sessionStorage.getItem('authToken'); // Get the token from sessionStorage

    if (token) {
      //   // Set the headers with the bearer token
      const headers = new HttpHeaders({
        'Authorization': 'Bearer ' + token // Include the token in the request headers
          });
    return this.http.post<any>(`${this.apiUrl}/action/update-many`, { ids, updateData }, { headers });
        } else {
          //   // Handle the case where there's no token (e.g., user is not authenticated)
          //   // You can choose to return an error Observable or handle it in a way that suits your application.
             return throwError('No authentication token found'); // For example, using throwError from RxJS
            }
  }
  sendNotification(contact_ids: string[], fullname: any) {
    const token = sessionStorage.getItem('authToken'); // Get the token from sessionStorage

    if (token) {
      //   // Set the headers with the bearer token
      const headers = new HttpHeaders({
        'Authorization': 'Bearer ' + token // Include the token in the request headers
          });
    return this.http.post<any>(`${this.apiUrl}/action/send-notification`, { contact_ids, fullname }, { headers });
        } else {
          //   // Handle the case where there's no token (e.g., user is not authenticated)
          //   // You can choose to return an error Observable or handle it in a way that suits your application.
             return throwError('No authentication token found'); // For example, using throwError from RxJS
            }
  }

  sendMessageToUser(contact_ids: string[], message: any) {
    const token = sessionStorage.getItem('authToken'); // Get the token from sessionStorage

    if (token) {
      //   // Set the headers with the bearer token
      const headers = new HttpHeaders({
        'Authorization': 'Bearer ' + token // Include the token in the request headers
          });
    return this.http.post<any>(`${this.apiUrl}/action/send-message`, { contact_ids, message }, { headers });
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
