#  Digital Agriculture Trading Platform

[![Spring Boot](https://img.shields.io/badge/Backend-Spring%20Boot%203.2.5-brightgreen)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/Frontend-React%2019-blue)](https://react.dev/)
[![Microservices](https://img.shields.io/badge/Architecture-Microservices-orange)](https://microservices.io/)
[![Docker](https://img.shields.io/badge/Deployment-Docker-blue)](https://www.docker.com/)

A modern, full-stack digital marketplace designed to bridge the gap between farmers and retailers. This platform empowers farmers to list their produce directly and enables retailers to browse, order, and track agricultural products seamlessly.

---

##  Features

###  For Farmers
- **Product Listing:** Easily upload and manage agricultural products with details like price, quantity, and category.
- **Order Management:** Track incoming orders from retailers and manage fulfillment.
- **Farmer Dashboard:** Overview of sales, active listings, and notifications.
- **Profile Management:** Maintain vendor details and contact information.

###  For Retailers
- **Product Marketplace:** Browse a wide variety of fresh produce directly from farmers.
- **Secure Ordering:** Place orders with real-time stock validation and status tracking.
- **Notifications:** Get updates on order approvals and new product arrivals.
- **Retailer Profile:** Manage business details and order history.

###  Common Features
- **Centralized Authentication:** Secure login and registration for both roles.
- **Service Discovery:** Backend services are managed via Netflix Eureka.
- **API Gateway:** Unified entry point for all frontend requests.
- **Centralized Configuration:** Managed settings across all microservices.

---

##  Technical Architecture

The project follows a **Microservices Architecture** to ensure scalability, resilience, and ease of deployment.

### Backend (Java Spring Boot)
- **`eureka-discovery-service`**: Service registry for dynamic service discovery.
- **`api-gateway`**: Routes requests to appropriate services and handles cross-cutting concerns.
- **`config-server`**: Externalizes configuration for all microservices.
- **`user-management-service`**: Handles authentication, registration, and user profiles.
- **`product-service`**: Manages the product catalog and inventory.
- **`order-service`**: Processes and tracks agricultural trade orders.

### Frontend (React & TypeScript)
- Built with **React 19** and **React Router v7**.
- Styled using **Tailwind CSS v4** for a modern, responsive UI.
- Powered by **Vite** for optimized build performance.

---

##  Project Structure

```text
DigitalAgri/
├── Backend/                    # Java Spring Boot Microservices
│   ├── api-gateway/            # Unified API Entry Point
│   ├── config-server/          # Centralized Configuration
│   ├── eureka-discovery-service/# Service Registry
│   ├── product-service/        # Product & Inventory Management
│   ├── order-service/          # Order Processing
│   └── user-management-service/# Auth & User Profiles
├── Frontend/                   # React TypeScript Application
│   ├── app/                    # Main Application Logic
│   │   ├── routes/             # Page Routing (Home, Login, Profile, etc.)
│   │   └── components/         # Reusable UI Components
│   └── public/                 # Static Assets
└── README.md                   # Project Documentation
```

---

##  Getting Started

### Prerequisites
- **Java 17** or higher
- **Node.js 20+** and **npm**
- **Maven 3.8+**
- **Docker** (Optional, for containerization)

### Backend Setup
1. Navigate to the `Backend` directory.
2. Build the services:
   ```bash
   mvn clean install
   ```
3. Start the core services in order:
   - `eureka-discovery-service`
   - `config-server`
   - `api-gateway`
   - Remaining services (`user-management`, `product`, `order`)

### Frontend Setup
1. Navigate to the `Frontend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

---

##  Docker Support
Each service (both Backend and Frontend) includes a `Dockerfile` for containerized deployment. 

To build an image:
```bash
docker build -t digital-agri-service-name .
```

---
