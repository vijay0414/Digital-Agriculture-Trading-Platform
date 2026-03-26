package com.example.productservice.controller;

import com.example.productservice.dto.CreateProductRequest;
import com.example.productservice.entity.Product;
import com.example.productservice.service.ProductService;
import com.example.productservice.dto.UpdateProductRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;


import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/farmers/me/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping
    public Product createProduct(@RequestBody CreateProductRequest request) {
        return productService.createProduct(request);
    }

    @GetMapping
    public List<Product> getFarmerProducts(@RequestParam Long farmerId) {
        return productService.getProductsByFarmer(farmerId);
    }
    @PutMapping("/{productId}")
    public Product updateProduct(
           @PathVariable UUID productId,
           @RequestBody UpdateProductRequest request
    ){
    return productService.updateProduct(productId, request);
    }

    @DeleteMapping("/{productId}")
public String deleteProduct(@PathVariable UUID productId) {
    productService.deleteProduct(productId);
    return "Product deleted successfully";
    }
    @GetMapping("/retailers/products")
public List<Product> getAllActiveProducts() {
    return productService.getAllActiveProducts();
}

@GetMapping("/retailers/products/category")
public List<Product> getActiveProductsByCategory(@RequestParam String category) {
    return productService.getActiveProductsByCategory(category);
}

@GetMapping("/retailers/products/search")
public List<Product> searchProducts(@RequestParam String name) {
    return productService.searchActiveProductsByName(name);
}
}