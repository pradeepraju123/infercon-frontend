import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { PlacementService } from '../../services/placement.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  MAT_DIALOG_DATA, MatDialog, MatDialogRef,
} from '@angular/material/dialog';
import { PlacementEnquiryComponent } from '../../components/placement-enquiry/placement-enquiry.component';
@Component({
  selector: 'app-placement',
  templateUrl: './placement.component.html',
  styleUrl: './placement.component.css'
})
export class PlacementComponent implements OnInit {
  placementdata: any;
  generaldata: any = {}; // Initialize with an empty object
  generalId: string | null = null; // Add a property to store the training ID
  constructor(private route: ActivatedRoute, 
    private placementService: PlacementService,  
    private location : Location, 
    private _snackBar: MatSnackBar, 
    @Inject(MAT_DIALOG_DATA) public data: {itemId: string},
    private dialogRef: MatDialogRef<PlacementComponent>,
    public dialog: MatDialog) {}

  ngOnInit(): void {
    const id = this.data.itemId;
    if (id){
      this.generalId = id;
      if (this.generalId) {
        this.getCareerLIST(this.generalId);
      }
    }
     
  }
  
  getCareerLIST(generalId: string) {
    this.placementService.getCareerList(generalId).subscribe(
      (data) => {
        this.placementdata = data;
        console.log(this.placementdata)
  
      },
      (error) => {
        console.error('Failed to fetch career details:', error);
      }
    );
  }
  goBack(): void {
    this.location.back(); // This uses the Angular Location service to navigate back.
  }
  openDialogPlacementEnquiry(job_id: String) {
    this.dialog.open(PlacementEnquiryComponent, {
      data: {
        itemId: job_id
      }
    });
  }
}
