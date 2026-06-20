# Mini-Amazon E-Commerce & Inventory Management System
## Final Project Documentation

### 1. Project Overview
This project is a fully functional, full-stack E-Commerce Storefront and Inventory Management System. It provides a split architecture with a secure **Inventory Dashboard** for Administrators and a beautiful **Mini-Amazon Storefront** for Customers. 

### 2. Live Deployment
- **Live Application URL:** [https://inventory-management-424w.onrender.com](https://inventory-management-424w.onrender.com)
- **Live Swagger OpenAPI URL:** [https://inventory-management-424w.onrender.com/swagger-ui/index.html](https://inventory-management-424w.onrender.com/swagger-ui/index.html)

### 3. Technology Stack
- **Backend Framework:** Java 17, Spring Boot 3.2.5
- **Frontend:** Vanilla HTML5, CSS3 (Modern Flexbox/Grid), JavaScript (ES6)
- **Database:** H2 Embedded Database (File-based)
- **Security:** Spring Security with stateless JWT (JSON Web Tokens)
- **Documentation:** Springdoc OpenAPI (Swagger 3)
- **Testing:** JUnit 5, Mockito
- **Deployment:** Render (Dockerized Environment)

### 4. Key Architectural Features

#### 4.1 Role-Based Access Control (RBAC) & JWT
The system uses strict Role-Based Access Control to separate user experiences:
- **`ROLE_ADMIN`:** Has full CRUD access to add, update, and delete Products and Categories. Only admins can access the backend inventory dashboard.
- **`ROLE_USER`:** Has read-only access to view products and access the dynamic Shopping Cart and Checkout pipelines.
- Security is strictly enforced using a custom `JwtFilter` extending `OncePerRequestFilter`.

#### 4.2 Dynamic Shopping Cart & Stock Management
The frontend leverages a complex, stateful shopping cart built in Vanilla JavaScript. 
- When an item is added to the cart, the available stock on the UI immediately updates in real-time.
- If an item is removed from the cart, the reserved stock is dynamically released back into the store.
- Order calculation logic seamlessly multiplies unit prices by cart quantities.

#### 4.3 Global Exception Handling & Bean Validation
To ensure maximum API stability and adherence to professional standards, the backend utilizes strict data validation:
- **Bean Validation:** Entities are strictly annotated with constraints like `@NotBlank` and `@Min(value = 0)`.
- **Global Controller Advice:** A `@ControllerAdvice` class intercepts all `MethodArgumentNotValidException` triggers, completely hiding internal Java stack traces from the end user and instead returning clean, formatted `400 Bad Request` JSON maps.

#### 4.4 Automated Unit Testing
The application guarantees stability through robust unit testing across all architectural layers:
- **Repository Layer (`@DataJpaTest`):** Verifies correct JPA mapping and database persistence.
- **Service Layer (`@ExtendWith(MockitoExtension.class)`):** Uses `@Mock` and `@InjectMocks` to isolate business logic and test core calculations independent of the database.
- **Controller Layer:** Verifies HTTP request mapping and JSON response structures.

### 5. Deployment Architecture
The system was successfully containerized using a multi-stage `Dockerfile`. The Docker container handles building the Gradle project using `eclipse-temurin:17-jdk` and then seamlessly copies the compiled `.jar` and the pre-populated `inventory_db.mv.db` database into a lightweight `eclipse-temurin:17-jre` runtime environment for production hosting on Render.
