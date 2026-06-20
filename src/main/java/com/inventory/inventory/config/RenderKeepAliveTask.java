package com.inventory.inventory.config;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.net.HttpURLConnection;
import java.net.URL;

@Component
public class RenderKeepAliveTask {

    /**
     * Render free tier spins down the web service after 15 minutes of inactivity.
     * This scheduled task pings the application's own URL every 10 minutes (600,000 ms) 
     * to keep the service awake and permanently visible.
     */
    @Scheduled(fixedRate = 600000)
    public void pingRender() {
        try {
            // Pinging the public Render URL to simulate external traffic
            URL url = new URL("https://inventory-management-424w.onrender.com/api/products");
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.connect();
            
            int responseCode = connection.getResponseCode();
            System.out.println("Keep-Alive Ping to Render executed. Status Code: " + responseCode);
        } catch (Exception e) {
            System.err.println("Keep-Alive Ping failed: " + e.getMessage());
        }
    }
}
