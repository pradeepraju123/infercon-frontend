import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { HttpClient } from '@angular/common/http';
import Chart from 'chart.js/auto';
import { Router } from '@angular/router';
// In your dashboard component
interface TrainingStats {
  totalLeads: number;
  registeredLeads: number;
  paidLeads: number;  // Now based on is_fee field
  rejectedLeads: number;
}
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  followupLeads: any[] = [];
  newEnrollments: any[] = [];
  chart: any;
   trainingStats: any = {
    totalLeads: 0,
    registeredLeads: 0,
    paidLeads: 0,
    rejectedLeads: 0
  };
  constructor(private userService: UserService, private http: HttpClient,private router:Router) {}
   ngOnInit(): void {
    this.userService.getDashboardData().subscribe({
      next: (res) => {
        this.followupLeads = res.data.followupLeads;
        this.newEnrollments = res.data.newEnrollments;
        if (res.data.trainingStats) {
          this.trainingStats = res.data.trainingStats;
        }
        this.buildChart();
      },
      error: (err) => {
        console.error('Error loading dashboard data:', err);
      }
    });
  }
  buildChart() {
    if (this.chart) {
      this.chart.destroy(); // destroy old instance before creating new one
    }
    const labels = ['Followups', 'New Enrollments'];
    const dataCounts = [this.followupLeads.length, this.newEnrollments.length];
    this.chart = new Chart('canvas', {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Leads Overview',
            data: dataCounts,
            backgroundColor: ['#36A2EB', '#FFCE56'],
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
  // Add this method to your DashboardComponent class
formatTime(time24: string): string {
  if (!time24) return '—';
  const [hours, minutes] = time24.split(':');
  let hoursNum = parseInt(hours);
  const ampm = hoursNum >= 12 ? 'PM' : 'AM';
  hoursNum = hoursNum % 12;
  hoursNum = hoursNum ? hoursNum : 12; // Convert 0 to 12
  return `${hoursNum}:${minutes} ${ampm}`;
}
}









