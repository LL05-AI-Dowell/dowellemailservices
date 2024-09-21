export default {
    SUCCESS: 'The operation has been successful.',
    SOMETHING_WENT_WRONG: 'Something went wrong!',
    NOT_FOUND: (entity) => `${entity} not found.`,
    TOO_MANY_REQUESTS: 'Too many requests! Please try again later.',
    VALIDATION_ERROR: 'The operation was invalid or there were validation issues.',
    PRFORM_VALIDATION_ERROR: 'Unable to perform validation operation. Please check and try again.',
    ALREADY_EXIST: (entity, identifier) => `${entity} already exist with ${identifier}`,
    UNAUTHORIZED: 'You are not authorized to perform this action',
    MAXIMUM_TIME_CONSUMED: 'You have consumed the maximum allowed time.'
};
