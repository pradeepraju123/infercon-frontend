import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InstallmentService {
  private apiUrl = 'https://api.inferconautomation.com/api/v1/users/active';

  constructor(private http: HttpClient) {}

  getActiveUsers(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
}
