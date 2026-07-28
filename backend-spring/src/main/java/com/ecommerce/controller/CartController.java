package com.ecommerce.controller;

import com.ecommerce.dto.AddCartItemRequest;
import com.ecommerce.entity.Cart;
import com.ecommerce.entity.User;
import com.ecommerce.service.AuthService;
import com.ecommerce.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@SuppressWarnings("null")
public class CartController {

    private final CartService cartService;
    private final AuthService authService;

    @GetMapping
    public Map<String, Object> getCart(@AuthenticationPrincipal UserDetails principal) {
        Cart cart = cartService.getOrCreateActiveCart(currentUserId(principal));
        return toResponse(cart);
    }

    @PostMapping("/items")
    public Map<String, Object> addItem(@AuthenticationPrincipal UserDetails principal,
                                       @Valid @RequestBody AddCartItemRequest request) {
        Cart cart = cartService.addItem(currentUserId(principal), request);
        return toResponse(cart);
    }

    @DeleteMapping("/items/{itemId}")
    public Map<String, Object> removeItem(@AuthenticationPrincipal UserDetails principal,
                                          @PathVariable Long itemId) {
        Cart cart = cartService.removeItem(currentUserId(principal), itemId);
        return toResponse(cart);
    }

    private Long currentUserId(UserDetails principal) {
        User user = authService.getByEmail(principal.getUsername());
        return user.getId();
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
