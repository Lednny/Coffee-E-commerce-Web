import { Component, signal, OnInit, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd, ActivatedRoute, ChildrenOutletContexts } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Navbar } from "./core/components/navbar/navbar";
import { Footer } from "./core/components/footer/footer";
import { filter } from 'rxjs';
import { slideInAnimation } from './animations/route-animations';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Navbar, Footer, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
  animations: [slideInAnimation]
})
export class App implements OnInit {
  protected readonly title = signal('coffee-web');
  
  private _router = inject(Router);
  private _activatedRoute = inject(ActivatedRoute);
  private _contexts = inject(ChildrenOutletContexts);
  
  shouldHideNavbarFooter = false;

  ngOnInit() {
    this._router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this._checkRouteData();
    });
  }

  getRouteAnimationData() {
    const context = this._contexts.getContext('primary');
    const animationData = context?.route?.snapshot?.data?.['animation'];
    console.log('Animation data:', animationData); // Para debug
    return animationData || 'default';
  }

  private _checkRouteData() {
    let route = this._activatedRoute;
    while (route.firstChild) {
      route = route.firstChild;
    }
    
    route.data.subscribe(data => {
      this.shouldHideNavbarFooter = data['hideNavbarFooter'] || false;
    });
  }
}
