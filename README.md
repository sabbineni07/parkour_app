# Parkour - Angular Single Page Application

An Angular single page application with Navy Blue theme, featuring Bootstrap styling and jqwidgets UI controls.

## Features

- **Login Screen**: User authentication interface with form validation
- **Dashboard**: Home screen with header and left navigation panel
- **Datasets Management**: View and manage datasets with Grid and Card views
- **Navy Blue Theme**: Custom color scheme matching Navy Blue branding
- **Bootstrap 5**: Responsive styling framework
- **jqwidgets**: Rich UI controls library (jqxTabs, jqxGrid)

## Project Structure

```
parkour/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── login/
│   │   │   │   ├── login.component.ts
│   │   │   │   ├── login.component.html
│   │   │   │   └── login.component.css
│   │   │   └── dashboard/
│   │   │       ├── dashboard.component.ts
│   │   │       ├── dashboard.component.html
│   │   │       └── dashboard.component.css
│   │   ├── app.component.ts
│   │   ├── app.component.html
│   │   ├── app.component.css
│   │   └── app.module.ts
│   ├── assets/
│   ├── styles.css
│   ├── index.html
│   └── main.ts
├── angular.json
├── package.json
└── tsconfig.json
```

## Installation

1. Install dependencies:
```bash
npm install
```

## Development

Run the development server:
```bash
npm start
```

Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Build

Build the project for production:
```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Docker Deployment

### Prerequisites
- Docker and Docker Compose installed

### Production Build

Build and run the production Docker container:
```bash
# Build and start production container
make prod

# Or manually:
docker-compose up -d
```

The application will be available at `http://localhost:4200`

### Development Mode

Run the application in development mode with hot-reload:
```bash
# Build and start development container
make dev

# Or manually:
docker-compose -f docker-compose.dev.yml up -d
```

### Available Make Commands

```bash
make help          # Show all available commands
make build         # Build production Docker image
make up            # Start production container
make down          # Stop production container
make logs          # View production container logs
make dev-build     # Build development Docker image
make dev-up        # Start development container
make dev-down      # Stop development container
make dev-logs      # View development container logs
make clean         # Remove containers and volumes
```

### Docker Compose Commands

**Production:**
```bash
docker-compose up -d          # Start in background
docker-compose down            # Stop and remove containers
docker-compose logs -f         # Follow logs
docker-compose restart         # Restart containers
```

**Development:**
```bash
docker-compose -f docker-compose.dev.yml up -d
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml logs -f
```

## Components

### Login Component
- Form validation for username and password
- Navy Blue themed styling
- Redirects to dashboard on successful login

### Dashboard Component
- Header with app title and user welcome message
- Left navigation panel with menu items
- Main content area
- Logout functionality

## Color Theme

The application uses Navy blue color scheme:
- Primary: #003087 (Navy Blue)
- Secondary: #004C97
- Accent: #0066CC
- Background: #F5F5F5

## Technologies

- Angular 17
- Bootstrap 5.3.2
- jqwidgets 18.0.0
- TypeScript 5.2.2
- RxJS 7.8.0

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)


