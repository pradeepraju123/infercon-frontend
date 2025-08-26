import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-notification-bell',
  templateUrl: './notification-bell.component.html',
  styleUrls: ['./notification-bell.component.css']
})
export class NotificationBellComponent implements OnInit, OnDestroy {
  @Input() assigneeName: string = '';
  unreadCount: number = 0;
  private notificationSub!: Subscription;
  private userId: string = '';
  constructor(
    private notificationService: NotificationService,
    private authService: AuthService
  ) {}
  ngOnInit(): void {
    const token = sessionStorage.getItem('authToken');
    this.userId = this.authService.getUserIdFromToken(token) || '';
    // Initial load
    this.loadAssigneeUnreadCount();
    // Subscribe to notification updates (reactive)
    this.notificationSub = this.notificationService.notificationUpdate$.subscribe(() => {
      this.loadAssigneeUnreadCount();
    });
  }
  loadAssigneeUnreadCount(): void {
    if (this.userId && this.assigneeName) {
      this.notificationService.getNotificationsCountByAssignee(this.userId, this.assigneeName)
        .subscribe({
          next: (res: any) => {
            this.unreadCount = res.count || 0; // always keep as number
          },
          error: (err) => {
            console.error('Error loading assignee unread count:', err);
            this.loadGeneralUnreadCount();
          }
        });
    } else {
      this.loadGeneralUnreadCount();
    }
  }
  loadGeneralUnreadCount(): void {
    if (this.userId) {
      this.notificationService.getUnreadCount(this.userId)
        .subscribe({
          next: (res: any) => {
            this.unreadCount = res.count || 0;
          },
          error: (err) => console.error('Error loading general unread count:', err)
        });
    }
  }
  ngOnDestroy(): void {
    if (this.notificationSub) {
      this.notificationSub.unsubscribe();
    }
  }
}