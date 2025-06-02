import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { AuthService } from '../auth.service';


export interface Template {
  course_id: string;
  course_content: string[];
  imageUrl?: string; // URL string for image stored on server
  template_title_first:string;
  template_title_second:string;
  template_title_third:string;

}

@Injectable({
  providedIn: 'root'
})
export class TemplateService {
  private apiUrl = 'https://api.inferconautomation.com/api/v1/templates'; // Change to your backend URL
   //private excelUrl_contacts='https://api.inferconautomation.com/api/v1/users/bulkupload';
 // private apiUrl = 'http://localhost:8081/api/v1/templates'; // Change to your backend URL



  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders | null {
    const token = sessionStorage.getItem('authToken');
    if (token) {
      return new HttpHeaders({
        'Authorization': 'Bearer ' + token
      });
    }
    return null;
  }

  getAll(): Observable<any> {
    const headers = this.getAuthHeaders();
    if (headers) {
      return this.http.get(this.apiUrl, { headers });
    } else {
      return throwError(() => new Error('No authentication token found'));
    }
  }
 

  create(data: FormData): Observable<any> {
    const headers = this.getAuthHeaders();
    if (headers) {
      return this.http.post(this.apiUrl, data, { headers });
    } else {
      return throwError(() => new Error('No authentication token found'));
    }
  }

  update(id: string, data: FormData): Observable<any> {
    const headers = this.getAuthHeaders();
    if (headers) {
      return this.http.put(`${this.apiUrl}/${id}`, data, { headers });
    } else {
      return throwError(() => new Error('No authentication token found'));
    }
  }

  delete(id: string): Observable<any> {
    const headers = this.getAuthHeaders();
    if (headers) {
      return this.http.delete(`${this.apiUrl}/${id}`, { headers });
    } else {
      return throwError(() => new Error('No authentication token found'));
    }
  }



  //LOCAL TESTING
  // getAll(): Observable<any> {
  //     return this.http.get(this.apiUrl);
   
  // }

  // create(data: FormData): Observable<any> {
  //     return this.http.post(this.apiUrl, data);
    
  // }

  // update(id: string, data: FormData): Observable<any> {
  //     return this.http.put(`${this.apiUrl}/${id}`, data);
    
  // }

  // delete(id: string): Observable<any> {
  //     return this.http.delete(`${this.apiUrl}/${id}`);
    
  // }
}
