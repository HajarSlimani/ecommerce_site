package com.ecommerce.service;

import com.ecommerce.dto.PricingRequestDto;
import com.ecommerce.dto.PricingResponseDto;
import com.ecommerce.entity.PriceHistory;
import com.ecommerce.entity.Product;
import com.ecommerce.repository.CompetitorPriceRepository;
import com.ecommerce.repository.PriceHistoryRepository;
import com.ecommerce.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class PricingService {

    private final ProductRepository productRepository;
    private final CompetitorPriceRepository competitorPriceRepository;
    private final PriceHistoryRepository priceHistoryRepository;
    private final RestTemplate restTemplate;

    @Value("${PRICING_ENGINE_URL:http://ml-service:8000}")
    private String pricingEngineUrl;

    @Transactional
    public PricingResponseDto refreshProductPrice(Long productId, Float demandScore) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found: " + productId));

        int stock = (int) product.getUnits().stream()
            .filter(unit -> unit.getStatus().name().equals("AVAILABLE"))
            .count();

        List<BigDecimal> competitorPrices = competitorPriceRepository
                .findTop10ByProductIdOrderByCapturedAtDesc(productId)
                .stream()
                .map(cp -> cp.getPrice())
                .toList();

        PricingRequestDto request = PricingRequestDto.builder()
                .productId(product.getId())
                .basePrice(product.getBasePrice())
                .stock(stock)
                .demandScore(demandScore)
                .competitorPrices(competitorPrices)
                .timestamp(LocalDateTime.now())
                .build();

        PricingResponseDto response = callPricingEngine(request);

        BigDecimal oldPrice = product.getBasePrice();
        product.setBasePrice(response.getRecommendedPrice());
        productRepository.save(product);

        priceHistoryRepository.save(PriceHistory.builder()
                .product(product)
                .oldPrice(oldPrice)
                .newPrice(response.getRecommendedPrice())
                .reason("dynamic-pricing")
                .timestamp(LocalDateTime.now())
                .build());

        return response;
    }

    public PricingResponseDto callPricingEngine(PricingRequestDto request) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<PricingRequestDto> entity = new HttpEntity<>(request, headers);

            PricingResponseDto response = restTemplate.postForObject(
                    pricingEngineUrl + "/api/pricing/recommend",
                    entity,
                    PricingResponseDto.class
            );

            if (response == null || response.getRecommendedPrice() == null) {
                return fallbackPricing(request);
            }

            return response;
        } catch (Exception ex) {
            return fallbackPricing(request);
        }
    }

    private PricingResponseDto fallbackPricing(PricingRequestDto request) {
        BigDecimal price = request.getBasePrice();

        if (request.getDemandScore() > 0.7f) {
            price = price.multiply(BigDecimal.valueOf(1.10));
        } else if (request.getDemandScore() < 0.3f) {
            price = price.multiply(BigDecimal.valueOf(0.95));
        }

        if (request.getStock() < 5) {
            price = price.multiply(BigDecimal.valueOf(1.08));
        }

        price = price.setScale(2, RoundingMode.HALF_UP);

        return PricingResponseDto.builder()
                .productId(request.getProductId())
                .recommendedPrice(price)
                .confidence(0.55f)
                .modelVersion("fallback-rule-v1")
                .build();
    }
}
