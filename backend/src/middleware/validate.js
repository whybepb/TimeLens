/**
 * Validation Middleware
 * Uses Joi for request validation
 */

const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            return res.status(400).json({
                error: 'Validation Error',
                message: 'Invalid request data',
                details: errors
            });
        }

        next();
    };
};

module.exports = validate;
