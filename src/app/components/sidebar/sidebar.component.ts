import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface MenuItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  @Input() menuItems: MenuItem[] = [];
  @Input() activeMenuItem: MenuItem | null = null;
  @Input() isOpen: boolean = true;
  @Output() menuItemClick = new EventEmitter<MenuItem>();

  getIconClasses(iconName: string): string {
    const iconMap: { [key: string]: string } = {
      'home': 'bi-house-door',
      'file-text': 'bi-file-text',
      'database': 'bi-database',
      'settings': 'bi-gear',
      'user': 'bi-person-circle',
      'check-circle': 'bi-check-circle',
      'login': 'bi-person-circle login-icon',
      'biometric': 'bi-fingerprint biometric-icon'
    };
    return `bi ${iconMap[iconName] || 'bi-circle'}`;
  }

  onMenuItemClick(item: MenuItem) {
    this.menuItemClick.emit(item);
  }
}

