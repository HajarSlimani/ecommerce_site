package com.ecommerce.controller;

import com.ecommerce.dto.CreateProductRequest;
import com.ecommerce.dto.PricingResponseDto;
import com.ecommerce.entity.Product;
import com.ecommerce.entity.ProductUnit;
import com.ecommerce.repository.PriceHistoryRepository;
import com.ecommerce.service.PricingService;
import com.ecommerce.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final PricingService pricingService;
    private final PriceHistoryRepository priceHistoryRepository;

    @GetMapping
    public List<Map<String, Object>> getProducts() {
        return productService.getAllProducts().stream()
                .map(this::toProductSummary)
                .toList();
    }

    @GetMapping("/{id}")
    public Map<String, Object> getProduct(@PathVariable Long id) {
        Product product = productService.getProduct(id);
        Map<String, Object> response = toProductSummary(product);
        response.put("priceHistory", priceHistoryRepository.findByProductIdOrderByTimestampDesc(id));
        return response;
    }

    @PostMapping
    public Map<String, Object> createProduct(@Valid @RequestBody CreateProductRequest request) {
        Product created = productService.createProduct(request);
        return toProductSummary(created);
    }

    @PostMapping("/{id}/price/refresh")
    public PricingResponseDto refreshPrice(@PathVariable Long id,
                                           @RequestParam(defaultValue = "0.5") Float demandScore) {
        return pricingService.refreshProductPrice(id, demandScore);
    }

    @PatchMapping("/{id}/price")
    public Map<String, Object> updatePrice(@PathVariable Long id,
                                           @RequestParam BigDecimal price,
                                           @RequestParam(required = false) String reason) {
        Product product = productService.updateBasePrice(id, price, reason);
        return toProductSummary(product);
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "ok"));
    }

    // Map.of(...) rejette toute valeur null (NullPointerException) : une
    // description ou une image absente en base faisait planter cet endpoint.
    // LinkedHashMap accepte les valeurs nulles et préserve l'ordre d'insertion.
    private Map<String, Object> toProductSummary(Product product) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", product.getId());
        map.put("name", product.getName());
        map.put("description", product.getDescription());
        map.put("basePrice", product.getBasePrice());
        map.put("imageUrl", product.getImageUrl());
        map.put("category", product.getCategory().getName());
        map.put("stock", product.getUnits().stream()
                .filter(unit -> unit.getStatus().name().equals("AVAILABLE"))
                .count());
        map.put("units", product.getUnits().stream().map(this::toUnitSummary).toList());
        return map;
    }

    private Map<String, Object> toUnitSummary(ProductUnit unit) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", unit.getId());
        map.put("serialNumber", unit.getSerialNumber());
        map.put("grade", unit.getGrade());
        map.put("currentPrice", unit.getCurrentPrice());
        map.put("status", unit.getStatus());
        map.put("acquisitionDate", unit.getAcquisitionDate());
        return map;
    }
}
