/**
 * @swagger
 * components:
 *   schemas:
 *     LoginDTO:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: user@example.com
 *         password:
 *           type: string
 *           format: password
 *           example: securePassword123
 *           minLength: 8
 *
 *     SignupDTO:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         name:
 *           type: string
 *           example: John Doe
 *           minLength: 2
 *         email:
 *           type: string
 *           format: email
 *           example: user@example.com
 *         password:
 *           type: string
 *           format: password
 *           example: securePassword123
 *           minLength: 8
 *
 *     AuthResponseDTO:
 *       type: object
 *       properties:
 *         status:
 *           type: boolean
 *           example: true
 *         msg:
 *           type: string
 *           example: Authentication successful
 *         data:
 *           $ref: '#/components/schemas/AuthData'
 *
 *     AuthData:
 *         type: object
 *         properties:
 *           token:
 *             type: string
 *             example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *           user:
 *             $ref: '#/components/schemas/ProfileData'
 *
 *     ProfileData:
 *         type: object
 *         properties:
 *           name:
 *             type: string
 *             example: John Doe
 *           email:
 *             type: string
 *             example: john@doe.com
 *           uid:
 *             type: string
 *             example: 123456
 *
 */
