import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { MatTableDataSource } from '@angular/material/table';
@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit {
  notifications: any[] = [];
  displayedColumns: string[] = ['message', 'status', 'date', 'actions'];
  userId: string = '';
  userType: string | null = null;  // :white_check_mark: Added
  isAdmin: boolean = false;
  loading = false;
  notificationDataSource = new MatTableDataSource<any>();
  // Pagination
  notificationPageSize = 20;
  notificationCurrentPage = 1;
  notificationTotalItems = 0;
  notificationTotalPages = 1;
  constructor(
    private notificationService: NotificationService,
    private authService: AuthService
  ) {}
ngOnInit(): void {
  const token = sessionStorage.getItem('authToken');
  if (token) {
    const extractedUserId = this.authService.getUserIdFromToken(token);
    this.userType = this.authService.getUserTypeFromToken(token);
    if (extractedUserId) {
      this.userId = extractedUserId;
      this.isAdmin = this.userType === 'admin';
      // console.log('User ID:', this.userId);
      // console.log('User Type:', this.userType);
      // Update displayed columns based on user type
      this.displayedColumns = this.isAdmin
        ? ['message', 'createdBy', 'status', 'date', 'actions']
        : ['message', 'status', 'date', 'actions'];
      this.loadNotifications();
    }else {
        console.error('Could not extract userId from token');
      }
    } else {
      console.error('No authToken found in sessionStorage');
    }
  }
  getNotificationStartItem(): number {
    return (this.notificationCurrentPage - 1) * this.notificationPageSize + 1;
  }
  getNotificationEndItem(): number {
    return Math.min(this.notificationCurrentPage * this.notificationPageSize, this.notificationTotalItems);
  }
  loadNotifications(page: number = 1): void {
    this.loading = true;
    this.notificationService.getUserNotifications(this.userId, page, this.notificationPageSize)
      .subscribe({
        next: (response: any) => {
          this.notifications = response.data || [];
          this.notifications.forEach(n => {
            if (this.isAdmin) {
              if (n.createdBy && typeof n.createdBy === 'object') {
                n.createdByDisplay = n.createdBy.name || n.createdBy.username || 'Unknown';
              } else {
                n.createdByDisplay = 'System';
              }
            }
          });
          this.notificationCurrentPage = response.pagination?.currentPage || 1;
          this.notificationTotalItems = response.pagination?.totalItems || this.notifications.length;
          this.notificationTotalPages = Math.ceil(this.notificationTotalItems / this.notificationPageSize);
          this.updateNotificationDataSource();
          this.loading = false;
        },
        error: (err) => {
          console.error('Error fetching notifications:', err);
          this.loading = false;
        }
      });
  }
  updateNotificationDataSource(): void {
    this.notificationDataSource.data = this.notifications;
  }
  markAsRead(id: string): void {
    this.notificationService.markAsRead(id).subscribe({
      next: () => {
        const notification = this.notifications.find(n => n._id === id);
        if (notification) {
          notification.isRead = true;
          this.updateNotificationDataSource(); // Update to remove highlight
        }
      },
      error: (err) => console.error('Error marking as read:', err)
    });
  }
  markAllAsRead(): void {
    this.notificationService.markAllAsRead(this.userId).subscribe({
      next: () => {
        this.notifications.forEach(n => n.isRead = true);
        this.updateNotificationDataSource(); // Update to remove highlights
      },
      error: (err) => console.error('Error marking all as read:', err)
    });
  }
  onPageChange(event: any): void {
    const page = event.pageIndex + 1;
    this.notificationPageSize = event.pageSize;
    this.loadNotifications(page);
  }
  getNotificationPageNumbers(): number[] {
    const maxPagesToShow = 5;
    let startPage = Math.max(1, this.notificationCurrentPage - 2);
    let endPage = Math.min(this.notificationTotalPages, startPage + maxPagesToShow - 1);
    if (endPage - startPage < maxPagesToShow - 1 && startPage > 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  }
  goToNotificationPage(page: number) {
    if (page >= 1 && page <= this.notificationTotalPages && page !== this.notificationCurrentPage) {
      this.notificationCurrentPage = page;
      this.loadNotifications(page);
    }
  }
  goToNotificationFirstPage() { this.goToNotificationPage(1); }
  goToNotificationPreviousPage() { this.goToNotificationPage(this.notificationCurrentPage - 1); }
  goToNotificationNextPage() { this.goToNotificationPage(this.notificationCurrentPage + 1); }
  goToNotificationLastPage() { this.goToNotificationPage(this.notificationTotalPages); }
  // Helper method to check if a notification is unread
  isUnread(notification: any): boolean {
    return !notification.isRead;
  }
}









