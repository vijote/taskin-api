import { NextFunction, Request, Response } from "express";
import { AppException } from "../core/utils";

function ErrorMiddleware(err: AppException | Error, req: Request, res: Response, _next: NextFunction) {
    // Error logging
    console.error('Error ocurred!', {
        route: req.url,
        error: err.message
    })

    // Response handling
    res.status((err as AppException)?.statusCode || 500).json({
        message: "An error ocurred processing your request",
        error: err.message
    })
}

export default ErrorMiddleware;