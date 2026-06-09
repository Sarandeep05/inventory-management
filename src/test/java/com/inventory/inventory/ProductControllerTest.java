package com.inventory.inventory;

import com.inventory.inventory.controller.ProductController;
import com.inventory.inventory.entity.Product;
import com.inventory.inventory.service.ProductService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
public class ProductControllerTest {

    @Mock
    private ProductService productService;

    @InjectMocks
    private ProductController productController;

    @Test
    public void testGetAllProducts() {
        Product p = new Product();
        p.setName("Mock");
        when(productService.getAllProducts()).thenReturn(Collections.singletonList(p));
        
        List<Product> response = productController.getAllProducts();
        assertThat(response).isNotEmpty();
        assertThat(response.get(0).getName()).isEqualTo("Mock");
    }
}
