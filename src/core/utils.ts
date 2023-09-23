export function isString(value: unknown) {
    return typeof value !== 'string' || value.trim().length == 0
}

export class AppException extends Error {
    statusCode: number

    constructor(message: string, statusCode: number) {
        super(message)
        this.statusCode = statusCode
    }
}