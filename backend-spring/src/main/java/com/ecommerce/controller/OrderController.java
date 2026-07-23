package com.ecommerce.controller;

import com.ecommerce.entity.Order;
import com.ecommerce.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @GetMapping("/{userId}")
    public List<Map<String, Object>> getOrders(@PathVariable Long userId) {
        return orderService.getUserOrders(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    @PostMapping("/{userId}/checkout")
    public Map<String, Object> checkout(@PathVariable Long userId) {
        Order order = orderService.checkout(userId);
        return toResponse(order);
    }

    private Map<String, Object> toResponse(Order order) {
        return Map.of(
                "id", order.getId(),
                "userId", order.getUser().getId(),
                "totalAmount", order.getTotalAmount(),
                "status", order.getStatus(),
                "createdAt", order.getCreatedAt(),
                "items", order.getItems().stream().map(item -> Map.of(
                        "id", item.getId(),
                        "productUnitId", item.getProductUnit().getId(),
                        "productName", item.getProductUnit().getProduct().getName(),
                        "unitPrice", item.getUnitPrice()
                )).toList()
        );
    }
}
