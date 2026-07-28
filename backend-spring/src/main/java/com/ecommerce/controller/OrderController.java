package com.ecommerce.controller;

import com.ecommerce.entity.Order;
import com.ecommerce.entity.User;
import com.ecommerce.service.AuthService;
import com.ecommerce.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final AuthService authService;

    @GetMapping
    public List<Map<String, Object>> getOrders(@AuthenticationPrincipal UserDetails principal) {
        return orderService.getUserOrders(currentUserId(principal)).stream()
                .map(this::toResponse)
                .toList();
    }

    @PostMapping("/checkout")
    public Map<String, Object> checkout(@AuthenticationPrincipal UserDetails principal) {
        Order order = orderService.checkout(currentUserId(principal));
        return toResponse(order);
    }

    private Long currentUserId(UserDetails principal) {
        User user = authService.getByEmail(principal.getUsername());
        return user.getId();
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
