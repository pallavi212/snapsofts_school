/**
 * Backend validation — mirrors src/utils/validators.js rules.
 * Returns an object of { field: errorMessage }.
 * Empty object means all valid.
 */

function validateName(value) {
    const v = (value || '').trim();
    if (!v) return 'Name is required';
    if (!/^[a-zA-Z\s]+$/.test(v)) return 'Name can only contain letters and spaces';
    if (v.length < 3) return 'Name must be at least 3 characters';
    if (v.length > 50) return 'Name must be at most 50 characters';
    return '';
}

/**
 * Strict Gmail-only email validation.
 *
 * Rules enforced:
 *  - Required (non-empty after trim)
 *  - Exactly one @ symbol
 *  - Username before @ must be at least 1 char: letters, digits, dots, underscores, hyphens, plus signs
 *  - Domain must be exactly "gmail.com" — nothing more, nothing less
 *  - Rejects: spaces, @gmail.com.com, multiple dots after @, other domains, missing username
 */
function validateEmail(value) {
    const v = (value || '').trim();
    if (!v) {
        console.warn('[Validation] Email is empty');
        return 'Email is required';
    }
    if (/\s/.test(v)) {
        console.warn('[Validation] Email contains spaces:', v);
        return 'Enter valid Gmail address (example@gmail.com)';
    }
    const atParts = v.split('@');
    if (atParts.length !== 2) {
        console.warn('[Validation] Email has wrong number of @ symbols:', v);
        return 'Enter valid Gmail address (example@gmail.com)';
    }
    const [username, domain] = atParts;
    if (!username || !/^[a-zA-Z0-9._+%-]+$/.test(username)) {
        console.warn('[Validation] Email username invalid:', v);
        return 'Enter valid Gmail address (example@gmail.com)';
    }
    if (domain.toLowerCase() !== 'gmail.com') {
        console.warn('[Validation] Email domain is not gmail.com:', v);
        return 'Enter valid Gmail address (example@gmail.com)';
    }
    return '';
}

function validatePhone(value) {
    const v = (value || '').trim();
    if (!v) return 'Phone number is required';
    if (!/^\d+$/.test(v)) return 'Phone number must contain only digits';
    if (v.length !== 10) return 'Phone number must be exactly 10 digits';
    return '';
}

function validateDOB(value) {
    if (!value) return 'Date of birth is required';
    const dob = new Date(value);
    if (isNaN(dob.getTime())) return 'Invalid date format';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dob > today) return 'Date of birth cannot be in the future';
    const age = today.getFullYear() - dob.getFullYear() -
        (today < new Date(today.getFullYear(), dob.getMonth(), dob.getDate()) ? 1 : 0);
    if (age < 3) return 'Minimum age is 3 years';
    if (age > 100) return 'Maximum age is 100 years';
    return '';
}

/**
 * Validate fields common to student/teacher/enquiry forms.
 * Pass only the fields you want to validate.
 * @param {{ name?, email?, phone?, dob? }} fields
 * @returns {{ [field]: string }} errors — empty means valid
 */
function validateCommonFields({ name, email, phone, dob } = {}) {
    const errors = {};
    if (name !== undefined) { const e = validateName(name); if (e) errors.name = e; }
    if (email !== undefined) { const e = validateEmail(email); if (e) errors.email = e; }
    if (phone !== undefined) { const e = validatePhone(phone); if (e) errors.phone = e; }
    if (dob !== undefined) { const e = validateDOB(dob); if (e) errors.dob = e; }
    return errors;
}

module.exports = { validateName, validateEmail, validatePhone, validateDOB, validateCommonFields };
