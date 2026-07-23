package com.ecommerce.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PricingResponseDto {

    private Long productId;
    private BigDecimal recommendedPrice;
    private Float confidence;
    private String modelVersion;
}
