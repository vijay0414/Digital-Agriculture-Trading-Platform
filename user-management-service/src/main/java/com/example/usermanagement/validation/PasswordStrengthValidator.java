package com.example.usermanagement.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.regex.Pattern;

/**
 * Custom validator for password strength.
 * Required:
 * - at least 8 chars
 * - at least one uppercase char
 * - at least one lowercase char
 * - at least one digit
 * - at least one special char (@$!%*?&)
 */
public class PasswordStrengthValidator implements ConstraintValidator<PasswordStrength, String> {

    private static final String PASSWORD_PATTERN = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$";

    @Override
    public boolean isValid(String password, ConstraintValidatorContext context) {
        if (password == null) {
            return false;
        }
        return Pattern.matches(PASSWORD_PATTERN, password);
    }
}
