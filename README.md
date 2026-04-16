# Food Delivery Frontend

## Overview

A modern, responsive food delivery web application built with React and Vite. This frontend provides an intuitive user interface for customers to discover restaurants, customize orders, and track deliveries in real-time.

## Features

- **User Authentication**: Secure login and registration system
- **Restaurant Discovery**: Browse restaurants by cuisine, rating, and location
- **Interactive Menu**: Detailed menu items with customization options
- **Smart Cart**: Add, modify, and manage cart items with real-time updates
- **Secure Checkout**: Integrated Razorpay payment processing
- **Order Tracking**: Real-time order status updates and delivery tracking
- **User Profiles**: Manage personal information and delivery addresses
- **Restaurant Dashboard**: Complete management interface for restaurant owners
- **Admin Panel**: System-wide administrative controls
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Dark/Light Theme**: Modern UI with Tailwind CSS styling

## Tech Stack

- **Framework**: React 18 with Hooks
- **Build Tool**: Vite for fast development and optimized production builds
- **Routing**: React Router v6 for client-side navigation
- **Styling**: Tailwind CSS for utility-first CSS framework
- **HTTP Client**: Axios for API communication
- **Payment**: Razorpay checkout modal for secure payment processing
- **Icons**: React Icons library
- **State Management**: React Context API for global state

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager
- Running backend API server (see backend README)

### Installation

1. **Navigate to the frontend directory:**

   ```bash
   cd frontend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Environment Configuration:**
   Create a `.env` file in the frontend root directory:

   ```
   VITE_API_URL=http://localhost:5000/api
   VITE_RAZORPAY_KEY_ID=your_razorpay_key_id_here
   ```

4. **Start Development Server:**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173` with hot module replacement.

## Application Structure

### Pages & Routes

- **`/` - Home**: Restaurant discovery with search and filtering
- **`/restaurant/:id` - Restaurant Page**: Detailed menu browsing and ordering
- **`/cart` - Cart Page**: Review and modify cart contents
- **`/checkout` - Checkout Page**: Secure payment processing (protected)
- **`/orders` - Orders Page**: Order history and tracking (protected)
- **`/profile` - Profile Page**: User account management (protected)
- **`/login` - Login Page**: User authentication
- **`/register` - Register Page**: New user registration
- **`/restaurant-dashboard` - Restaurant Dashboard**: Restaurant management (owner only)
- **`/admin-dashboard` - Admin Dashboard**: System administration (admin only)
- **`/menu-management` - Menu Management**: Menu item CRUD operations (owner only)

### Components

- **Navbar**: Navigation with cart indicator and user menu
- **RestaurantCard**: Restaurant preview cards with ratings and cuisine types
- **MenuItem**: Individual menu item display with add-to-cart functionality
- **Cart**: Shopping cart sidebar/modal
- **OrderTracker**: Real-time order status visualization
- **AuthContext**: Global authentication state management

## Sample Data & Testing

### Sample User Accounts

Use these credentials to test different user roles:

| Email               | Password      | Role             | Access Level                   |
| ------------------- | ------------- | ---------------- | ------------------------------ |
| `customer@test.com` | `password123` | Customer         | Full customer features         |
| `owner@test.com`    | `password123` | Restaurant Owner | Restaurant + customer features |
| `admin@test.com`    | `password123` | Admin            | All features                   |

### Sample Restaurants

The application includes 8 pre-seeded restaurants:

- **Pizza Palace** (Italian) - Classic pizzas with fresh ingredients
- **Burger House** (American) - Gourmet burgers and craft beverages
- **Sushi Master** (Japanese) - Fresh sushi and traditional dishes
- **Taco Fiesta** (Mexican) - Authentic street food and tacos
- **Golden Dragon** (Chinese) - Traditional cuisine with modern twists
- **Mediterranean Delight** (Middle Eastern) - Fresh Mediterranean specialties
- **Vegan Paradise** (Vegan) - Plant-based cuisine
- **Pasta Bella** (Italian) - Homemade pasta dishes

### Testing Scenarios

1. **Customer Journey**:
   - Register/login as customer
   - Browse restaurants and menus
   - Add items to cart with customizations
   - Proceed to checkout and complete payment
   - Track order status
   - View order history

2. **Restaurant Owner Journey**:
   - Login as restaurant owner
   - Access restaurant dashboard
   - Manage menu items (add/edit/delete)
   - View and update order statuses
   - Monitor restaurant performance

3. **Admin Journey**:
   - Login as admin
   - Access admin dashboard
   - View all users, restaurants, and orders
   - Manage system-wide settings

## Development Workflow

### Available Scripts

- **`npm run dev`**: Start development server with hot reloading
- **`npm run build`**: Create optimized production build
- **`npm run preview`**: Preview production build locally

### Key Features Implementation

#### Authentication Flow

- JWT tokens stored in localStorage
- Automatic token refresh and validation
- Protected routes with role-based access
- Secure logout with token cleanup

#### Cart Management

- Persistent cart state across sessions
- Real-time price calculations
- Item customization (extras, quantity)
- Cart validation before checkout

#### Payment Integration

- Razorpay checkout modal for secure card input
- Payment intent creation on backend
- Order confirmation with payment details
- Error handling for failed payments

#### Real-time Updates

- Order status polling
- Live cart updates
- Dynamic menu availability

## API Integration

The frontend communicates with the backend API through Axios:

### Key API Endpoints Used

- `GET /restaurants` - Fetch restaurant listings
- `GET /restaurants/:id` - Get restaurant details and menu
- `POST /orders` - Place new orders
- `GET /orders` - Retrieve user orders
- `POST /payments/create-payment-intent` - Initialize payments
- `POST /auth/login` - User authentication

### Error Handling

- Network error boundaries
- User-friendly error messages
- Automatic retry for failed requests
- Loading states for better UX

## Project Structure

```
frontend/
├── public/                    # Static assets
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── Cart.jsx
│   │   ├── MenuItem.jsx
│   │   ├── Navbar.jsx
│   │   ├── OrderTracker.jsx
│   │   └── RestaurantCard.jsx
│   ├── context/              # React Context providers
│   │   └── AuthContext.jsx
│   ├── pages/                # Page components
│   │   ├── AdminDashboard.jsx
│   │   ├── CartPage.jsx
│   │   ├── CheckoutPage.jsx
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── MenuManagement.jsx
│   │   ├── Orders.jsx
│   │   ├── Profile.jsx
│   │   ├── Register.jsx
│   │   ├── RestaurantDashboard.jsx
│   │   └── RestaurantPage.jsx
│   ├── services/             # API service functions
│   │   └── api.js
│   ├── App.jsx               # Main app component
│   ├── index.css             # Global styles
│   └── main.jsx              # App entry point
├── index.html
├── package.json
├── tailwind.config.js        # Tailwind configuration
├── vite.config.js            # Vite configuration
└── postcss.config.js         # PostCSS configuration
```

## Deployment

### Production Build

```bash
npm run build
```

### Environment Variables for Production

Ensure these environment variables are set in your deployment platform:

- `VITE_API_URL`: Backend API URL
- `VITE_RAZORPAY_KEY_ID`: Razorpay key ID

### Deployment Platforms

- **Vercel**: Automatic deployments with preview URLs
- **Netlify**: Static hosting with form handling
- **AWS S3 + CloudFront**: Scalable static website hosting
- **Docker**: Containerized deployment

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Follow React best practices and component structure
2. Use Tailwind CSS utility classes for styling
3. Implement proper error boundaries
4. Add loading states for async operations
5. Test across different screen sizes
6. Follow existing naming conventions

## Troubleshooting

### Common Issues

1. **API Connection Errors**:
   - Verify backend server is running
   - Check `VITE_API_URL` environment variable
   - Ensure CORS is properly configured

2. **Payment Issues**:
   - Verify Razorpay keys are correct
   - Check payment method validity
   - Review Razorpay dashboard for errors

3. **Authentication Problems**:
   - Clear localStorage and relogin
   - Check JWT token expiration
   - Verify user roles and permissions

4. **Build Errors**:
   - Clear node_modules and reinstall
   - Check Node.js version compatibility
   - Verify all dependencies are installed

## License

This project is licensed under the ISC License.
