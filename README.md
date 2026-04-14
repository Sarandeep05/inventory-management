# Inventory & Order Management API

## Tech Stack
- Java 17
- Spring Boot
- Spring Security (JWT)
- MySQL
- JPA / Hibernate

## Features

### Authentication
- JWT आधारित login/signup
- BCrypt password encryption
- Roles: ADMIN, USER

### Category Management (Admin)
- Add / Update / Delete categories

### Product Management (Admin)
- Add / Update / Delete products
- Assign categories
- Manage stock & price

### Order Management (User)
- Place order
- Cancel order
- Auto stock update

### Filters
- Search by name
- Filter by category
- Low stock products
- Pagination & sorting

## API Endpoints

### Auth
- POST /auth/register
- POST /auth/login

### Products
- POST /products/add
- GET /products
- GET /products/search
- GET /products/category/{id}

### Orders
- POST /orders/place
- GET /orders/my-orders
- PUT /orders/cancel/{id}

## Swagger
http://localhost:8080/swagger-ui/index.html

## Author
Sarandeepraj
