/**
 * useForm Hook
 * Issue #376: Implement Comprehensive Form Validation Hook
 * 
 * A comprehensive custom hook for managing form state, validation, and submission.
 * Designed to be a lightweight alternative to libraries like Formik or React Hook Form.
 */

import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * useForm
 * 
 * @param {Object} options - Configuration options
 * @param {Object} options.initialValues - Initial values for the form fields
 * @param {Function} [options.validate] - Validation function returning an errors object
 * @param {Function} [options.onSubmit] - Submission handler: (values, { setSubmitting, resetForm }) => void
 * @param {boolean} [options.validateOnChange=true] - Whether to validate on change
 * @param {boolean} [options.validateOnBlur=true] - Whether to validate on blur
 * @returns {Object} Form state and handlers
 */
const useForm = ({
    initialValues = {},
    validate,
    onSubmit,
    validateOnChange = true,
    validateOnBlur = true,
}) => {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [dirty, setDirty] = useState(false);
    const [isValid, setIsValid] = useState(true);

    // Store initial values ref to check dirty state
    const initialValuesRef = useRef(initialValues);

    // Helper to validate entire form
    const validateForm = useCallback((formData = values) => {
        if (!validate) return {};

        const validationErrors = validate(formData);
        setErrors(validationErrors || {});
        setIsValid(Object.keys(validationErrors || {}).length === 0);
        return validationErrors || {};
    }, [validate, values]);

    // Reset form to initial state
    const resetForm = useCallback((newInitialValues = initialValues) => {
        setValues(newInitialValues);
        setErrors({});
        setTouched({});
        setDirty(false);
        setIsSubmitting(false);
        setIsValid(true);
        initialValuesRef.current = newInitialValues;
    }, [initialValues]);

    // Effect to validate on change if enabled
    useEffect(() => {
        if (validateOnChange) {
            validateForm(values);
        }
    }, [values, validateOnChange, validateForm]);

    // Handle input change
    const handleChange = useCallback((e) => {
        // Determine name and value based on event or direct call
        const { name, value, type, checked } = e.target;
        const finalValue = type === 'checkbox' ? checked : value;

        setValues((prev) => {
            const newValues = { ...prev, [name]: finalValue };
            // Check dirty state
            const isDirty = JSON.stringify(newValues) !== JSON.stringify(initialValuesRef.current);
            setDirty(isDirty);
            return newValues;
        });

        // Mark as dirty immediately for UI feedback
        if (!dirty) setDirty(true);
    }, [dirty]);

    // Handle input blur
    const handleBlur = useCallback((e) => {
        const { name } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));

        if (validateOnBlur) {
            validateForm(values);
        }
    }, [validateOnBlur, validateForm, values]);

    // Handle form submission
    const handleSubmit = useCallback(async (e) => {
        if (e && e.preventDefault) e.preventDefault();

        // Validate all fields on submit
        const validationErrors = validateForm(values);
        const hasErrors = Object.keys(validationErrors).length > 0;

        // Mark all fields as touched
        const allTouched = Object.keys(values).reduce((acc, key) => {
            acc[key] = true;
            return acc;
        }, {});
        setTouched(allTouched);

        if (hasErrors) {
            setErrors(validationErrors);
            setIsValid(false);
            return;
        }

        setIsSubmitting(true);

        if (onSubmit) {
            try {
                await onSubmit(values, {
                    setSubmitting: setIsSubmitting,
                    resetForm,
                    setErrors,
                });
            } catch (error) {
                setIsSubmitting(false);
                console.error("Form submission error:", error);
            }
        }
    }, [validateForm, values, onSubmit, resetForm]);

    // Helper to manually set a field value
    const setFieldValue = useCallback((name, value) => {
        setValues(prev => ({ ...prev, [name]: value }));
    }, []);

    // Helper to manually set a field error
    const setFieldError = useCallback((name, message) => {
        setErrors(prev => ({ ...prev, [name]: message }));
    }, []);

    // Helper to manually set field touched
    const setFieldTouched = useCallback((name, isTouched = true) => {
        setTouched(prev => ({ ...prev, [name]: isTouched }));
    }, []);

    return {
        values,
        errors,
        touched,
        isSubmitting,
        dirty,
        isValid,
        handleChange,
        handleBlur,
        handleSubmit,
        resetForm,
        setValues,
        setFieldValue,
        setFieldError,
        setFieldTouched,
        validateForm
    };
};

export default useForm;

/**
 * Example Usage:
 * 
 * const validate = (values) => {
 *   const errors = {};
 *   if (!values.email) errors.email = 'Required';
 *   else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
 *     errors.email = 'Invalid email address';
 *   }
 *   return errors;
 * };
 * 
 * const MyForm = () => {
 *   const { handleChange, handleSubmit, values, errors } = useForm({
 *     initialValues: { email: '' },
 *     validate,
 *     onSubmit: (values) => console.log(values)
 *   });
 * 
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <input
 *         name="email"
 *         onChange={handleChange}
 *         value={values.email}
 *       />
 *       {errors.email && <div>{errors.email}</div>}
 *       <button type="submit">Submit</button>
 *     </form>
 *   );
 * };
 */
