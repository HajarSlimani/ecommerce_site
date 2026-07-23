package com.ecommerce.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PricingRequestDto {

    @NotNull
    private Long productId;

    @NotNull
    private BigDecimal basePrice;

    @NotNull
    private Integer stock;

    @NotNull
    private Float demandScore;

    @Builder.Default
    private List<BigDecimal> competitorPrices = List.of();

    @NotNull
    private LocalDateTime timestamp;
}
