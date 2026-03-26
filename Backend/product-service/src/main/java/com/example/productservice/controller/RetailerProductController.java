package com.example.productservice.controller;

import com.example.productservice.entity.Product;
import com.example.productservice.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/retailers/products")
@RequiredArgsConstructor
public class RetailerProductController {

    private final ProductService productService;

    @GetMapping
    public List<Product> getAllActiveProducts() {
        return productService.getAllActiveProducts();
    }

    @GetMapping("/category")
    public List<Product> getActiveProductsByCategory(@RequestParam String category) {
        return productService.getActiveProductsByCategory(category);
    }

    @GetMapping("/search")
    public List<Product> searchProducts(@RequestParam String name) {
        return productService.searchActiveProductsByName(name);
    }
}