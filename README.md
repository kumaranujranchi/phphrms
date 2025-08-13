# HRMS Frontend

React-based frontend for the HRMS (Human Resource Management System) application, optimized for Netlify deployment.

## Features

- **Modern UI/UX**: Built with React, TypeScript, and Tailwind CSS
- **Responsive Design**: Mobile-first approach with responsive components
- **Authentication**: JWT-based authentication with role-based access
- **Dashboard**: Interactive dashboards for employees and admins
- **Attendance Management**: Check-in/check-out with location tracking
- **Leave Management**: Apply and manage leave requests
- **Expense Management**: Submit and track expense claims
- **Payroll**: View salary and payroll information
- **Employee Directory**: Search and manage employee information
- **Real-time Updates**: Live data updates and notifications

## Tech Stack

- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible UI components
- **React Query**: Data fetching and caching
- **React Hook Form**: Form handling with validation
- **Zod**: Schema validation
- **Wouter**: Lightweight routing

## Prerequisites

- Node.js 18 or higher
- npm or yarn package manager
- Git

## Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
frontend/
├── client/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities and API services
│   │   ├── config/        # Configuration files
│   │   ├── styles/        # Global styles
│   │   └── utils/         # Helper functions
│   └── index.html         # HTML template
├── package.json           # Dependencies and scripts
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── netlify.toml           # Netlify deployment configuration
└── README.md             # This file
```

## Configuration

### API Configuration

The frontend connects to the PHP backend hosted on Hostinger. The API base URL is configured in:

- **Development**: `http://localhost:3000/api`
- **Production**: `https://yourdomain.com/api` (configured in `vite.config.ts`)

### Environment Variables

Create a `.env` file in the root directory for local development:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

## Deployment on Netlify

### Automatic Deployment

1. **Connect to GitHub**
   - Push your code to GitHub
   - Connect your repository to Netlify
   - Netlify will automatically detect the build settings

2. **Build Settings**
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: `18`

3. **Environment Variables**
   Set the following environment variables in Netlify:
   ```
   NODE_VERSION=18
   ```

### Manual Deployment

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   - Drag and drop the `dist` folder to Netlify
   - Or use Netlify CLI: `netlify deploy --prod --dir=dist`

## API Integration

The frontend communicates with the PHP backend through RESTful APIs:

### Authentication
- Login/Logout
- Password reset
- Profile management

### Core Features
- User management
- Attendance tracking
- Leave management
- Expense claims
- Payroll information

### Admin Features
- Employee management
- Leave approval
- Expense approval
- Dashboard analytics

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Code Style

- Use TypeScript for all new code
- Follow ESLint configuration
- Use Prettier for code formatting
- Write meaningful component and function names

### Component Guidelines

- Use functional components with hooks
- Implement proper TypeScript interfaces
- Follow accessibility guidelines
- Use Tailwind CSS for styling

## Troubleshooting

### Common Issues

1. **Build fails on Netlify**
   - Check Node.js version (should be 18+)
   - Verify build command and publish directory
   - Check for TypeScript errors

2. **API connection issues**
   - Verify API base URL configuration
   - Check CORS settings on backend
   - Ensure backend is running and accessible

3. **Styling issues**
   - Verify Tailwind CSS is properly configured
   - Check for missing CSS imports
   - Ensure responsive breakpoints are correct

### Getting Help

- Check the browser console for errors
- Verify network requests in browser dev tools
- Review Netlify build logs for deployment issues

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of the HRMS application suite.
