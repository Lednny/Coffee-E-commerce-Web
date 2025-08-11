import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { ViewChild, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements AfterViewInit, OnInit {
  @ViewChild('myCartDropdownButton1')
  myCartDropdownButton1!: ElementRef;
  @ViewChild("myCartDropdownButton1Btn")
  myCartDropdownButton1Btn!: ElementRef;

  scrolled = false;

  ngOnInit() {
  }

  ngAfterViewInit() {
    if (this.myCartDropdownButton1) {
      this.myCartDropdownButton1.nativeElement.click();
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.scrolled = window.pageYOffset > 50;
  }
}