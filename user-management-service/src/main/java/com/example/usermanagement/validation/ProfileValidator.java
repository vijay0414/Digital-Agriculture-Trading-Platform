package com.example.usermanagement.validation;

import com.example.usermanagement.dto.ProfileDTO;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class ProfileValidator implements ConstraintValidator<ValidProfile, ProfileDTO> {

    @Override
    public void initialize(ValidProfile annotation) {
    }

    @Override
    public boolean isValid(ProfileDTO profile, ConstraintValidatorContext context) {
        if (profile == null) {
            return true;
        }
        // At least one of farmName or businessName must be present
        return (profile.getFarmName() != null && !profile.getFarmName().isBlank()) ||
               (profile.getBusinessName() != null && !profile.getBusinessName().isBlank());
    }
}
