/**
 * @swagger
 * components:
 *   schemas:
 *     APIResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: boolean
 *           example: false
 *         msg:
 *           type: string
 *           example: Invalid credentials
 *
 *     ErrorResponseDTO:
 *       type: object
 *       properties:
 *         status:
 *           type: boolean
 *           example: false
 *         msg:
 *           type: string
 *           example: Invalid credentials
 *         errors:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               field:
 *                 type: string
 *                 example: email
 *               message:
 *                 type: string
 *                 example: Invalid email format
 */
