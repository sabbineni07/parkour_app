import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent, MenuItem } from '../sidebar/sidebar.component';
import { ApiService } from '../../services/api.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarComponent, RouterOutlet],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  username: string = '';
  sidebarOpen: boolean = true;
  menuItems: MenuItem[] = [
    { label: 'Home', route: '/dashboard/home', icon: 'home' },
    { label: 'Reports', route: '/dashboard/reports', icon: 'file-text' },
    { label: 'Datasets', route: '/dashboard/datasets', icon: 'database' },
    { label: 'Settings', route: '/dashboard/settings', icon: 'settings' },
    { label: 'Profile', route: '/dashboard/profile', icon: 'user' }
  ];
  activeMenuItem: MenuItem = this.menuItems[0];

  constructor(
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    // Check if user is authenticated
    const isAuthenticated = sessionStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
      this.router.navigate(['/login']);
      return;
    }

    this.username = sessionStorage.getItem('username') || 'User';

    // Update active menu item based on current route
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const currentRoute = event.urlAfterRedirects;
        // Find menu item that matches the current route
        const activeItem = this.menuItems.find(item => {
          const routePath = item.route.replace('/dashboard/', '');
          return currentRoute === item.route || currentRoute.endsWith('/' + routePath);
        });
        if (activeItem) {
          this.activeMenuItem = activeItem;
        }
      });

    // Set initial active menu item based on current route
    const currentUrl = this.router.url;
    const initialItem = this.menuItems.find(item => currentUrl === item.route || currentUrl.endsWith(item.route.split('/').pop() || ''));
    if (initialItem) {
      this.activeMenuItem = initialItem;
    }
  }

  onMenuItemClick(item: MenuItem) {
    this.activeMenuItem = item;
    // Navigate to the selected route
    this.router.navigate([item.route]);
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  logout() {
    this.apiService.removeToken();
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}

