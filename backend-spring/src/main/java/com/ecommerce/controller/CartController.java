package com.ecommerce.controller;

import com.ecommerce.dto.AddCartItemRequest;
import com.ecommerce.entity.Cart;
import com.ecommerce.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@SuppressWarnings("null")
public class CartController {

    private final CartService cartService;

    @GetMapping("/{userId}")
    public Map<String, Object> getCart(@PathVariable Long userId) {
        Cart cart = cartService.getOrCreateActiveCart(userId);
        return toResponse(cart);
    }

    @PostMapping("/{userId}/items")
    public Map<String, Object> addItem(@PathVariable Long userId,
                                       @Valid @RequestBody AddCartItemRequest request) {
        Cart cart = cartService.addItem(userId, request);
        return toResponse(cart);
    }

    @DeleteMapping("/{userId}/items/{itemId}")
    public Map<String, Object> removeItem(@PathVariable Long userId,
                                          @PathVariable Long itemId) {
        Cart cart = cartService.removeItem(userId, itemId);
        return toResponse(cart);
    }

    private Map<String, Object> toResponse(Cart cart) {
        BigDecimal total = cart.getItems().stream()
                .map(item -> item.getProductUnit().getCurrentPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return Map.of(
                "cartId", cart.getId(),
                "status", cart.getStatus(),
                "userId", cart.getUser().getId(),
                "items", cart.getItems().stream().map(item -> Map.of(
                        "id", item.getId(),
                        "productUnitId", item.getProductUnit().getId(),
                        "productName", item.getProductUnit().getProduct().getName(),
                        "unitPrice", item.getProductUnit().getCurrentPrice(),
                        "quantity", item.getQuantity(),
                        "subtotal", item.getProductUnit().getCurrentPrice().multiply(BigDecimal.valueOf(item.getQuantity()))
                )).toList(),
                "total", total
        );
    }
}
