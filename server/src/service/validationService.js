import joi from 'joi';

export const validateJoiSchema = (schema, value) => {
    const result = schema.validate(value);

    return {
        value: result.value,
        error: result.error
    };
};


export const emailSchema = joi.object({
    email: joi.string().email().required(),
})

export const loginSchema = joi.object({
    email: joi.string().email().required()
})