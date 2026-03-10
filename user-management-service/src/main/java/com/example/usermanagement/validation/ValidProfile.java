package com.example.usermanagement.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = ProfileValidator.class)
@Documented
public @interface ValidProfile {
    String message() default "Either farmName (for farmers) or businessName (for retailers) is required";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
