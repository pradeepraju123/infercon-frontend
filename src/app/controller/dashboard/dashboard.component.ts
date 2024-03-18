import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import Chart from 'chart.js/auto';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  users: any[]=[]; // Define a property to store the fetched data
  chart: any = [];
  constructor(private userService: UserService) { };

  ngOnInit(): void {
    this.userService.getAllUsers().subscribe((data: any) => {
      this.users = data.data;
    });
    this.chart = new Chart('canvas', {
      type: 'bar',
      data: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [
          {
            label: '# of Votes',
            data: [12, 19, 3, 5, 2, 3],
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }
  
}
