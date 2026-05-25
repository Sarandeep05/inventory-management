import java.sql.*;

public class FixDb {
    public static void main(String[] args) {
        String url = "jdbc:mysql://localhost:3306/inventory_db";
        String user = "root";
        String pass = "Sudharsun@1";

        try (Connection conn = DriverManager.getConnection(url, user, pass);
             Statement stmt = conn.createStatement()) {

            int updated = stmt.executeUpdate("UPDATE user SET role = 'ROLE_ADMIN' WHERE role = 'ROLE_ROLE_ADMIN'");
            int updatedUser = stmt.executeUpdate("UPDATE user SET role = 'ROLE_USER' WHERE role = 'ROLE_ROLE_USER'");
            
            System.out.println("Fixed " + updated + " admin users and " + updatedUser + " standard users.");

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
