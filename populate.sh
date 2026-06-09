#!/bin/bash
# Register Admin
curl -s -X POST http://localhost:8080/auth/register -H 'Content-Type: application/json' -d '{"name":"System Admin","email":"admin2@nexus.com","password":"admin","role":"ADMIN"}'

# Login
TOKEN=$(curl -s -X POST http://localhost:8080/auth/login -H 'Content-Type: application/json' -d '{"email":"admin2@nexus.com","password":"admin"}')

# Add Categories
CAT_ELEC=$(curl -s -X POST http://localhost:8080/categories -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"name":"Electronics"}' | grep -o '"id":[0-9]*' | grep -o '[0-9]*' | head -1)
CAT_OFF=$(curl -s -X POST http://localhost:8080/categories -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"name":"Office Supplies"}' | grep -o '"id":[0-9]*' | grep -o '[0-9]*' | head -1)
CAT_FURN=$(curl -s -X POST http://localhost:8080/categories -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"name":"Furniture"}' | grep -o '"id":[0-9]*' | grep -o '[0-9]*' | head -1)

# Add Products
curl -s -X POST http://localhost:8080/products/add -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"name\":\"MacBook Pro 16\", \"description\":\"M3 Max, 64GB RAM\", \"price\":3499.99, \"stock\":15, \"status\":\"ACTIVE\", \"categories\":[{\"id\":$CAT_ELEC}]}" > /dev/null
curl -s -X POST http://localhost:8080/products/add -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"name\":\"Ergonomic Chair\", \"description\":\"Lumbar support, adjustable\", \"price\":299.50, \"stock\":45, \"status\":\"ACTIVE\", \"categories\":[{\"id\":$CAT_OFF}, {\"id\":$CAT_FURN}]}" > /dev/null
curl -s -X POST http://localhost:8080/products/add -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"name\":\"Standing Desk\", \"description\":\"Dual-motor adjustable desk\", \"price\":450.00, \"stock\":10, \"status\":\"ACTIVE\", \"categories\":[{\"id\":$CAT_FURN}, {\"id\":$CAT_OFF}]}" > /dev/null
curl -s -X POST http://localhost:8080/products/add -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"name\":\"Sony WH-1000XM5\", \"description\":\"Noise-cancelling headphones\", \"price\":398.00, \"stock\":30, \"status\":\"ACTIVE\", \"categories\":[{\"id\":$CAT_ELEC}]}" > /dev/null
curl -s -X POST http://localhost:8080/products/add -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"name\":\"Wireless Mechanical Keyboard\", \"description\":\"Tactile switches, RGB\", \"price\":129.99, \"stock\":80, \"status\":\"ACTIVE\", \"categories\":[{\"id\":$CAT_ELEC}]}" > /dev/null
curl -s -X POST http://localhost:8080/products/add -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"name\":\"Dell UltraSharp 32\", \"description\":\"4K USB-C Hub Monitor\", \"price\":850.00, \"stock\":20, \"status\":\"ACTIVE\", \"categories\":[{\"id\":$CAT_ELEC}]}" > /dev/null

echo "Data populated successfully via API!"
