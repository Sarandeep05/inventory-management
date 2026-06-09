# Build stage
FROM eclipse-temurin:17-jdk-jammy AS build
WORKDIR /app

# Copy all project files
COPY . .

# Make gradlew executable and build the project
RUN chmod +x gradlew
RUN ./gradlew build -x test --no-daemon

# Run stage
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Copy the built jar file
COPY --from=build /app/build/libs/inventory-0.0.1-SNAPSHOT.jar app.jar

# Copy the pre-populated H2 database file so Render has the starter products
COPY inventory_db.mv.db .

# Expose the standard web port
EXPOSE 8080

# Start the application
ENTRYPOINT ["java", "-jar", "app.jar"]
