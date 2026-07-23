package com.ecommerce.service;

import com.ecommerce.dto.AddCartItemRequest;
import com.ecommerce.entity.*;
import com.ecommerce.enums.CartStatus;
import com.ecommerce.repository.CartItemRepository;
import com.ecommerce.repository.CartRepository;
import com.ecommerce.repository.ProductUnitRepository;
import com.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductUnitRepository productUnitRepository;
    private final UserRepository userRepository;

    public Cart getOrCreateActiveCart(Long userId) {
        return cartRepository.findByUserId(userId)
                .filter(cart -> cart.getStatus() == CartStatus.ACTIVE)
                .orElseGet(() -> createCart(userId));
    }

    @Transactional
    public Cart createCart(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        Cart cart = Cart.builder()
                .user(user)
                .status(CartStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .build();

        return cartRepository.save(cart);
    }

    @Transactional
    public Cart addItem(Long userId, AddCartItemRequest request) {
        Cart cart = getOrCreateActiveCart(userId);
        ProductUnit unit = productUnitRepository.findById(request.getProductUnitId())
                .orElseThrow(() -> new IllegalArgumentException("Product unit not found: " + request.getProductUnitId()));

        CartItem item = CartItem.builder()
                .cart(cart)
                .productUnit(unit)
                .quantity(request.getQuantity())
                .addedAt(LocalDateTime.now())
                .build();

        cartItemRepository.save(item);
        return cartRepository.findById(cart.getId()).orElseThrow();
    }

    @Transactional
    public Cart removeItem(Long userId, Long cartItemId) {
        Cart cart = getOrCreateActiveCart(userId);
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new IllegalArgumentException("Cart item not found: " + cartItemId));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new IllegalArgumentException("Item does not belong to user cart");
        }

        cartItemRepository.delete(item);
        return cartRepository.findById(cart.getId()).orElseThrow();
    }
}
