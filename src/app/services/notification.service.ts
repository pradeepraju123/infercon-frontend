// notification.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError,Subject,tap } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = 'https://api.inferconautomation.com/api/v1/notification';
  public notificationUpdate$ = new Subject<void>();
  constructor(private http: HttpClient) {}
  private getHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('authToken');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }
  // ADD THIS METHOD
  createNotification(notificationData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, notificationData, {
      headers: this.getHeaders()
    });
  }
  getUserNotifications(userId: string, page: number = 1, limit: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get(`${this.apiUrl}/user/${userId}`, {
      headers: this.getHeaders(),
      params
    });
  }
  getUnreadCount(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/unread-count/${userId}`, {
      headers: this.getHeaders()
    });
  }
   notifyUpdate() {
    this.notificationUpdate$.next();
  }
  markAsRead(notificationId: string): Observable<any> {
  return this.http.patch(`${this.apiUrl}/${notificationId}/read`, {}, { headers: this.getHeaders() })
    .pipe(tap(() => this.notifyUpdate()));
}
markAllAsRead(userId: string): Observable<any> {
  return this.http.patch(`${this.apiUrl}/user/${userId}/read-all`, {}, { headers: this.getHeaders() })
    .pipe(tap(() => this.notifyUpdate()));
}
  getNotificationsCountByAssignee(userId: string, assigneeName: string): Observable<any> {
  const params = new HttpParams()
    .set('assignee', assigneeName);
  return this.http.get(`${this.apiUrl}/count/user/${userId}`, {
    headers: this.getHeaders(),
    params
  });
}
  getLeadCreationNotifications(userId: string, page: number = 1, limit: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get(`${this.apiUrl}/lead-creation/${userId}`, {
      headers: this.getHeaders(),
      params
    });
  }
}









