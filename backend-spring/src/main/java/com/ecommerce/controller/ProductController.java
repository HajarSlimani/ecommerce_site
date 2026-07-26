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
        return Map.of(
                "id", product.getId(),
                "name", product.getName(),
                "description", product.getDescription(),
                "basePrice", product.getBasePrice(),
                "category", product.getCategory().getName(),
                "units", product.getUnits().stream().map(this::toUnitSummary).toList(),
                "priceHistory", priceHistoryRepository.findByProductIdOrderByTimestampDesc(id)
        );
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

    private Map<String, Object> toProductSummary(Product product) {
        return Map.of(
                "id", product.getId(),
                "name", product.getName(),
                "description", product.getDescription(),
                "basePrice", product.getBasePrice(),
                "category", product.getCategory().getName(),
                "stock", product.getUnits().stream()
                        .filter(unit -> unit.getStatus().name().equals("AVAILABLE"))
                        .count(),
                "units", product.getUnits().stream().map(this::toUnitSummary).toList()
        );
    }

    private Map<String, Object> toUnitSummary(ProductUnit unit) {
        return Map.of(
                "id", unit.getId(),
                "serialNumber", unit.getSerialNumber(),
                "grade", unit.getGrade(),
                "currentPrice", unit.getCurrentPrice(),
                "status", unit.getStatus(),
                "acquisitionDate", unit.getAcquisitionDate()
        );
    }
}
