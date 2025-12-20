package com.huseyincoban.localink_backend.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Bean;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI localinkOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Local Link API")
                        .version("1.0")
                        .description("Location-based social media API"));
    }
}
