import { Component, ElementRef } from '@angular/core';
import { ViewChild, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements AfterViewInit {
  @ViewChild('myCartDropdownButton1')
  myCartDropdownButton1!: ElementRef;
  @ViewChild("myCartDropdownButton1Btn")
  myCartDropdownButton1Btn!: ElementRef;

  ngAfterViewInit() {
    if (this.myCartDropdownButton1) {
      this.myCartDropdownButton1.nativeElement.click();
    }
  }
}