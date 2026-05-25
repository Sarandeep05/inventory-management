import java.sql.*;

public class CheckDb {
    public static void main(String[] args) {
        String url = "jdbc:mysql://localhost:3306/inventory_db";
        String user = "root";
        String pass = "Sudharsun@1";

        try (Connection conn = DriverManager.getConnection(url, user, pass);
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery("SELECT id, email, role FROM user")) {

            System.out.println("--- USERS IN DB ---");
            while (rs.next()) {
                System.out.println("ID: " + rs.getInt("id") + ", Email: " + rs.getString("email") + ", Role: [" + rs.getString("role") + "]");
            }
            System.out.println("-------------------");

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
